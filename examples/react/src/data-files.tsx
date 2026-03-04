import pino from 'pino';
import React, { useRef } from 'react';
import { Toolkit } from '@arcanejs/toolkit';

import type { TextInput as TextInputType } from '@arcanejs/toolkit';
import {
  ToolkitRenderer,
  Group,
  TextInput,
  Button,
  Tabs,
  Tab,
} from '@arcanejs/react-toolkit';
import {
  createDataFileDefinition,
  useDataFile,
  useDataFileContext,
  useDataFileUpdater,
} from '@arcanejs/react-toolkit/data';
import { z } from 'zod';
import path from 'path';

const DATA_DIR = path.join(path.dirname(__dirname), 'data', 'data-files');

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: '@arcanejs example',
});

toolkit.start({
  mode: 'automatic',
  port: 1335,
});

const ConfiguredFiles = createDataFileDefinition({
  schema: z.string().array(),
  defaultValue: [],
});

const IndividualFile = createDataFileDefinition({
  schema: z.object({
    text: z.string(),
  }),
  defaultValue: {
    text: 'Hello World',
  },
});

const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

const validateName = (name: string) => {
  if (!NAME_REGEX.exec(name)) {
    throw new Error('Invalid name');
  }
};

const File = ({ index, filename }: { index: number; filename: string }) => {
  const updateFiles = useDataFileUpdater(ConfiguredFiles);
  const { data, updateData } = useDataFile(IndividualFile, {
    path: path.join(DATA_DIR, 'files', `${filename}.json`),
    onPathChange: 'transfer',
    onError: (err) => {
      console.error(`An Arcane File Error: ${err.operation}`, err);
    },
  });
  const fileInputRef = useRef<TextInputType | null>(null);

  return (
    <Tab name={filename}>
      <Group direction="vertical">
        <Group>
          File Path:
          <TextInput value={filename} ref={fileInputRef} />
          <Button
            text="Update file"
            onClick={() => {
              const name = fileInputRef.current?.getValue() ?? '';
              validateName(name);
              updateFiles((current) => {
                const updated = [...current];
                updated[index] = name;
                return updated;
              });
            }}
          />
        </Group>
        <Group direction="vertical">
          {data.status === 'error' ? <>{`${data.error}`}</> : null}
          {data.data && (
            <Group>
              Data:
              <TextInput
                value={data.data.text}
                onChange={(text) =>
                  updateData((current) => ({ ...current, text }))
                }
              />
            </Group>
          )}
        </Group>
      </Group>
    </Tab>
  );
};

const Files = () => {
  const { data, updateData, error } = useDataFileContext(ConfiguredFiles);
  const fileInputRef = useRef<TextInputType | null>(null);

  return (
    <Group direction="vertical">
      {error ? <>{`${error}`}</> : null}
      <Group>
        <TextInput ref={fileInputRef} />
        <Button
          text={'Add File'}
          onClick={() => {
            const name = fileInputRef.current?.getValue() ?? '';
            validateName(name);
            updateData((current) => {
              // Only add the file if it doesn't already exist
              if (current.includes(name)) {
                throw new Error('File already exists');
              }
              return [...current, name];
            });
            fileInputRef.current?.setValue('');
          }}
        />
      </Group>
      <Tabs>
        {data.map((filename, index) => (
          <File key={index} index={index} filename={filename} />
        ))}
      </Tabs>
    </Group>
  );
};

const App = () => (
  <Group border>
    <ConfiguredFiles.Provider path={path.join(DATA_DIR, 'index.json')}>
      <Files />
    </ConfiguredFiles.Provider>
  </Group>
);

ToolkitRenderer.render(<App />, toolkit);
