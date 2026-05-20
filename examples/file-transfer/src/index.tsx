import path from 'path';
import pino from 'pino';
import { useCallback, useState } from 'react';
import { Toolkit, type ToolkitRenderContext } from '@arcanejs/toolkit';
import {
  Base,
  CallDownloadResponse,
  CallUploadResponse,
  EventEmitter,
} from '@arcanejs/toolkit/components/base';
import { IDMap } from '@arcanejs/toolkit/util';
import {
  CoreComponents,
  ToolkitRenderer,
  prepareComponents,
} from '@arcanejs/react-toolkit';

import {
  FILE_TRANSFER_NAMESPACE,
  FileTransferComponent,
  isFileTransferComponentCallDownload,
  isFileTransferComponentCallUpload,
} from './proto';
import { Readable } from 'node:stream';
import {
  AnyClientComponentCallDownload,
  AnyClientComponentCallUpload,
} from '@arcanejs/protocol';

const toolkit = new Toolkit({
  log: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
  title: '@arcanejs file transfer example',
  entrypointJsFile: path.resolve(
    __dirname,
    '../dist/file-transfer-entrypoint.js',
  ),
  clockSync: {
    pingIntervalMs: 2000,
  },
});

toolkit.start({
  mode: 'automatic',
  port: 1335,
});

type Events = {
  upload: (fileName: string, fileData: Readable) => Promise<void>;
  download: (fileName: string) => Promise<Readable>;
};

type FileTransferProps = Pick<FileTransferComponent, 'filenames'> & {
  onUpload?: Events['upload'];
  onDownload?: Events['download'];
};

class FileTransfer extends Base<
  typeof FILE_TRANSFER_NAMESPACE,
  FileTransferComponent,
  FileTransferProps
> {
  /** @hidden */
  private readonly events = new EventEmitter<Events>();

  public constructor(props: FileTransferProps) {
    super(
      {
        filenames: [],
      },
      props,
      {
        onPropsUpdated: (oldProps) => {
          this.events.processPropChanges(
            {
              onUpload: 'upload',
              onDownload: 'download',
            },
            oldProps,
            this.props,
          );
        },
      },
    );
    this.triggerInitialPropsUpdate();
  }

  addListener = this.events.addListener;
  removeListener = this.events.removeListener;

  public getProtoInfo = (
    idMap: IDMap,
    _context: ToolkitRenderContext,
  ): FileTransferComponent => ({
    namespace: FILE_TRANSFER_NAMESPACE,
    component: 'file-transfer',
    key: idMap.getId(this),
    filenames: this.props.filenames,
  });
  /** @hidden */
  public async handleCallUpload(
    call: AnyClientComponentCallUpload,
  ): Promise<CallUploadResponse> {
    if (isFileTransferComponentCallUpload(call, 'upload-file-demo')) {
      return async (data: Readable) =>
        this.events.call('upload', call.fileName, data).catch((cause) => {
          throw new Error('oops', { cause });
        });
    }
    throw new Error(`Unhandled call action: ${call.action}`);
  }

  /** @hidden */
  public async handleCallDownload(
    call: AnyClientComponentCallDownload,
  ): Promise<CallDownloadResponse> {
    if (isFileTransferComponentCallDownload(call, 'download-file-demo')) {
      return () =>
        this.events.call('download', call.fileName).then(async (stream) => ({
          stream: await stream,
          headers: {
            'Content-Disposition': `attachment; filename="${call.fileName}"`,
          },
        }));
    }
    throw new Error(`Unhandled call action: ${call.action}`);
  }
}

const C = prepareComponents(FILE_TRANSFER_NAMESPACE, {
  FileTransfer,
});

const App = () => {
  const [files, setFiles] = useState<Record<string, Buffer>>({});

  const onUpload = useCallback(async (fileName: string, fileData: Readable) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunks: any[] = [];
    for await (const chunk of fileData) {
      chunks.push(chunk);
    }
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileName]: Buffer.concat(chunks),
    }));
  }, []);

  const onDownload = useCallback(
    async (fileName: string) => {
      const fileData = files[fileName];
      if (!fileData) {
        throw new Error(`File not found: ${fileName}`);
      }
      const stream = new Readable();
      stream.push(fileData);
      stream.push(null);
      return stream;
    },
    [files],
  );

  return (
    <C.FileTransfer
      filenames={Object.keys(files)}
      onUpload={onUpload}
      onDownload={onDownload}
    />
  );
};

ToolkitRenderer.render(
  <App />,
  toolkit,
  {},
  { componentNamespaces: [CoreComponents, C] },
);
