import { promises as fs } from 'fs';
import React, {
  useMemo,
  useContext,
  createContext,
  type Context,
  type FC,
  type ReactNode,
  useState,
  useEffect,
  useRef,
} from 'react';
import z, { ZodType } from 'zod';
import { throttle } from 'lodash';
import { dirname } from 'path';
import { useLogger } from './logging';

type WithPathChange = {
  /**
   * When the file path changes and the file does not yet exist,
   * should the previous data be stored in the new file
   * or should the new file be reset to the default value?
   *
   * @default 'defaultValue'
   */
  onPathChange?: 'transfer' | 'defaultValue';
};

type DataFileUsage = WithPathChange & {
  /**
   * The path to where the JSON data should be stored,
   * this will be relative to the current working directory.
   */
  path: string;
};

export type ProviderProps = DataFileUsage & {
  children: ReactNode;
};

export type DataFileUpdater<T> = (update: (current: T) => T) => void;

export type DataFileContext<T> = {
  data: T;
  /**
   * False until the initial load from disk has completed.
   */
  status: 'loading' | 'error' | 'ready';
  /**
   * Last timestamp where {@link DataFileContext.data data} was updated
   * in-memory.
   *
   * **Note: This is not the last time the data was saved to disk.**
   * More specifically:
   * - If the data has been loaded from disk and not changed,
   *   then this will be the timestamp that it was loaded from disk.
   * - If the data has been updated since first loaded into memory,
   *   then this will be the timestamp of the last update.
   *
   * Uses the local timestamp in milliseconds, i.e. `Date.now()`.
   */
  lastUpdatedMillis: number;
  updateData: DataFileUpdater<T>;
  /**
   * Can be called to force an attempt to re-save the data to disk
   */
  saveData: () => void;
  /**
   * If an error has ocurred in the last operation (e.g. load or save,
   * then this will be set to that error).
   *
   * Can be used for example to re-prompt users to save data.
   */
  error: unknown;
};

export type DataFileDefinition<T> = {
  Provider: FC<ProviderProps>;
  context: Context<DataFileContext<T>>;
  useDataFile: (props: DataFileUsage) => DataFileCore<T>;
};

export function useDataFileData<T>(dataFile: DataFileDefinition<T>): T {
  return useContext(dataFile.context).data;
}

export function useDataFileUpdater<T>(
  dataFile: DataFileDefinition<T>,
): DataFileUpdater<T> {
  return useContext(dataFile.context).updateData;
}

/**
 * Convenience hook to use the internal data-file context hook
 */
export function useDataFileContext<T>(
  dataFile: DataFileDefinition<T>,
): DataFileContext<T> {
  return useContext(dataFile.context);
}

/**
 * Convenience hook to use the internal data-file definition hook
 * in a more react-like manner.
 */
export function useDataFile<T>(
  dataFile: DataFileDefinition<T>,
  usage: DataFileUsage,
): DataFileCore<T> {
  return dataFile.useDataFile(usage);
}

export type DataState<T> = {
  lastUpdatedMillis: number;
} & (
  | {
      status: 'loading';
      /**
       * The data is not yet loaded, so this will be undefined,
       * but it's listed here as a property so that the data property can be
       * directly used without a type-guard that uses `state`.
       *
       * This should hopefully also avoid situations where users may check for
       * `state === 'ready'` instead of `state !== 'loading'`,
       * and accidentally avoid displaying data that's available but unsaved.
       */
      data: undefined;
    }
  | { status: 'error'; data: T | undefined; error: unknown }
  | { status: 'ready'; data: T }
);

type InternalDataFileState<T> = {
  /**
   * Set to true after
   */
  initialized: boolean;
  path: string | null;
  data: T | undefined;
  previousData: T | undefined;
  lastUpdatedMillis: number;
  state: { state: 'error'; error: unknown } | { state: 'saved' | 'dirty' };
};

export type UseDataFileCoreProps<T> = WithPathChange & {
  schema: ZodType<T>;
  defaultValue: T;
  path: string;
};

export type DataFileCore<T> = {
  data: DataState<T>;
  updateData: DataFileUpdater<T>;
  saveData: () => void;
};

/**
 * Primary hook for & logic for using data files.
 */
export function useDataFileCore<T>({
  schema,
  defaultValue,
  path,
  onPathChange = 'defaultValue',
}: UseDataFileCoreProps<T>): DataFileCore<T> {
  const log = useLogger();

  /**
   * Maintain all data in a ref so that we can dynamically throttle the
   * writes to disk in a memoized function.
   */
  const state = useRef<InternalDataFileState<T>>({
    initialized: false,
    path: null,
    data: undefined,
    previousData: undefined,
    lastUpdatedMillis: Date.now(),
    state: {
      state: 'saved',
    },
  });

  // Ensure schema and default value are not changed after initialization
  useEffect(() => {
    if (!state.current.initialized) {
      state.current.initialized = true;
    } else {
      throw new Error(
        'Cannot change schema or defaultValue after initialization',
      );
    }
  }, [schema, defaultValue]);

  /**
   * Processed version of the state,
   * updates less regularly than the state,
   * but more often than file writes to disk.
   */
  const [data, setData] = useState<DataState<T>>({
    lastUpdatedMillis: state.current.lastUpdatedMillis,
    status: 'loading',
    data: undefined,
  });

  const updateDataFromState = useMemo(
    () => () => {
      const data = state.current.data;

      if (state.current.state.state === 'error') {
        setData({
          lastUpdatedMillis: state.current.lastUpdatedMillis,
          status: 'error',
          error: state.current.state.error,
          data,
        });
        return;
      }

      if (data === undefined) {
        setData({
          lastUpdatedMillis: state.current.lastUpdatedMillis,
          status: 'loading',
          data: undefined,
        });
        return;
      }

      setData({
        lastUpdatedMillis: state.current.lastUpdatedMillis,
        status: 'ready',
        data,
      });
    },
    [],
  );

  const saveData = useMemo(
    () =>
      throttle(
        async () => {
          if (state.current.state.state === 'saved') {
            // No need to save data that has already been saved
            return;
          }

          const currentPath = state.current.path;
          const currentData = state.current.data;
          if (!currentPath || currentData === undefined) {
            return;
          }

          try {
            const json = JSON.stringify(currentData, null, 2);
            await fs.mkdir(dirname(currentPath), { recursive: true });
            await fs.writeFile(currentPath, json, 'utf8');
            if (
              state.current.path === currentPath &&
              state.current.data === currentData
            ) {
              state.current.state = { state: 'saved' };
            }
          } catch (error) {
            if (
              state.current.path === currentPath &&
              state.current.data === currentData
            ) {
              state.current.state = { state: 'error', error };
              updateDataFromState();
            }
          }
        },
        500,
        {
          // Write leading so that we always write to disk quickly when
          // only single things have changed
          leading: true,
          // Trailing is important otherwise we may lose data
          trailing: true,
        },
      ),
    [],
  );

  useEffect(() => {
    // Set the new path, and attempt to load the file
    state.current = {
      ...state.current,
      path,
      data: undefined,
      previousData: state.current.data ?? state.current.previousData,
      state: {
        state: 'saved',
      },
    };
    fs.readFile(path, 'utf8')
      .then((data) => {
        const parsedData = schema.parse(JSON.parse(data));
        if (state.current.path === path) {
          state.current.data = parsedData;
          state.current.lastUpdatedMillis = Date.now();
          state.current.state = { state: 'saved' };
          updateDataFromState();
        }
      })
      .catch((error) => {
        // If file doesn't exist, then create it using the default value
        if (state.current.path !== path) {
          // Ignore error if path has changed
          return;
        }
        if (error.code === 'ENOENT') {
          // Initialise the state, and then write it to disk
          const initialData =
            onPathChange === 'transfer' &&
            state.current.previousData !== undefined
              ? state.current.previousData
              : defaultValue;
          state.current.data = initialData;
          state.current.lastUpdatedMillis = Date.now();
          state.current.state = { state: 'dirty' };
          log?.info(
            'Creating a new file at %s with initial data %o',
            path,
            initialData,
          );
          saveData();
          updateDataFromState();
          return;
        }

        state.current.state = { state: 'error', error };
        updateDataFromState();
      });
  }, [path, onPathChange]);

  const updateData: DataFileUpdater<T> = useMemo(
    () => (update) => {
      if (state.current.path !== path) {
        // Ignore any requests to update a file if the path has been changed
        return;
      }
      if (state.current.data === undefined) {
        throw new Error('Attempt to update data before it has been loaded');
      }
      state.current.data = update(state.current.data);
      state.current.lastUpdatedMillis = Date.now();
      state.current.state = { state: 'dirty' };
      saveData();
      updateDataFromState();
    },
    [path],
  );

  return {
    data,
    updateData,
    saveData,
  };
}

export type CreateDataFileDefinitionProps<T extends ZodType> = {
  schema: T;
  defaultValue: z.infer<T>;
};

export function createDataFileDefinition<T extends ZodType>({
  schema,
  defaultValue,
}: CreateDataFileDefinitionProps<T>): DataFileDefinition<z.infer<T>> {
  const context = createContext<DataFileContext<T>>({
    data: defaultValue,
    status: 'loading',
    lastUpdatedMillis: Date.now(),
    updateData: () => {
      throw new Error('Data file provider not used');
    },
    saveData: () => {
      throw new Error('Data file provider not used');
    },
    error: undefined,
  });

  const useDataFile = ({
    path,
    onPathChange,
  }: DataFileUsage): DataFileCore<T> =>
    useDataFileCore({
      schema,
      defaultValue,
      path,
      onPathChange,
    });

  /**
   * Create a specific provider function function component,
   * that will set up the context,
   * and create a boundary that only displays children once the data has loaded.
   */
  const Provider: FC<ProviderProps> = ({ path, onPathChange, children }) => {
    const { data, updateData, saveData } = useDataFile({
      path,
      onPathChange,
    });

    const providedContext: DataFileContext<T> = useMemo(
      () => ({
        data:
          data.status !== 'loading' && data.data !== undefined
            ? data.data
            : defaultValue,
        status: data.status,
        lastUpdatedMillis: data.lastUpdatedMillis,
        updateData,
        saveData,
        error: data.status === 'error' ? data.error : undefined,
      }),
      [data, updateData],
    );

    if (data.status === 'loading') {
      return <>Loading...</>;
    }

    return (
      <context.Provider value={providedContext}>{children}</context.Provider>
    );
  };

  return {
    Provider,
    context,
    useDataFile,
  };
}
