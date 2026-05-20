import {
  FC,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CORE_FRONTEND_COMPONENT_RENDERER,
  StageContext,
} from '@arcanejs/toolkit-frontend';
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import { FrontendComponentRenderer } from '@arcanejs/toolkit-frontend/types';
import {
  FILE_TRANSFER_NAMESPACE,
  FileTransferComponentProto,
  FileTransferDownloadMessage,
  FileTransferUploadMessage,
  isFileTransferComponent,
} from './proto';

type FileProps = {
  fileName: string;
  downloadFile: (filename: string) => Promise<ReadableStream<Uint8Array>>;
};

const File: FC<FileProps> = ({ fileName, downloadFile }) => {
  const [data, setData] = useState<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    downloadFile(fileName).then(async (stream) => {
      setData(await new Response(stream).bytes());
    });
  }, [fileName, downloadFile]);

  const src = useMemo(
    () => (data ? URL.createObjectURL(new Blob([data])) : null),
    [data],
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {fileName}
      <img src={src ?? undefined} alt={fileName} className="size-[200px]" />
    </div>
  );
};

const FileTransfer: React.FC<{ info: FileTransferComponentProto }> = ({
  info,
}) => {
  const { upload, download } = useContext(StageContext);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    upload?.<FileTransferUploadMessage>(
      {
        namespace: FILE_TRANSFER_NAMESPACE,
        type: 'component-call-upload',
        componentKey: info.key,
        action: 'upload-file-demo',
        fileName: file.name,
      },
      file,
    );
  };

  const downloadFile = async (filename: string) => {
    if (!download) {
      throw new Error('Download function not available');
    }
    return download<FileTransferDownloadMessage>({
      namespace: FILE_TRANSFER_NAMESPACE,
      type: 'component-call-download',
      componentKey: info.key,
      action: 'download-file-demo',
      fileName: filename,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col gap-1 rounded-md bg-arcane-bg p-arcane shadow-arcane-box-inset">
        <div className="text-[1rem] font-semibold text-arcane-text-active">
          File Transfer Demo
        </div>
        <input type="file" onChange={handleFileUpload} />
        <div className="flex flex-wrap gap-4">
          {info.filenames.map((filename) => (
            <File
              key={filename}
              fileName={filename}
              downloadFile={downloadFile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FILE_TRANSFER_FRONTEND_COMPONENT_RENDERER: FrontendComponentRenderer = {
  namespace: FILE_TRANSFER_NAMESPACE,
  render: (info): ReactElement => {
    if (!isFileTransferComponent(info)) {
      throw new Error(
        `Cannot render non-file-transfer component ${info.namespace}`,
      );
    }
    switch (info.component) {
      case 'file-transfer':
        return <FileTransfer info={info} />;
    }
  },
};

startArcaneFrontend({
  renderers: [
    CORE_FRONTEND_COMPONENT_RENDERER,
    FILE_TRANSFER_FRONTEND_COMPONENT_RENDERER,
  ],
});
