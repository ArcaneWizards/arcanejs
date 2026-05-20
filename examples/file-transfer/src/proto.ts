import {
  AnyComponentProto,
  BaseClientComponentCallDownload,
  BaseClientComponentCallUpload,
  BaseComponentProto,
} from '@arcanejs/protocol';

export const FILE_TRANSFER_NAMESPACE = 'file-transfer';

export type FileTransferComponentProto = BaseComponentProto<
  typeof FILE_TRANSFER_NAMESPACE,
  'file-transfer'
> & {
  filenames: string[];
};

export type FileTransferComponent = FileTransferComponentProto;

export const isFileTransferComponent = (
  component: AnyComponentProto,
): component is FileTransferComponent =>
  component.namespace === FILE_TRANSFER_NAMESPACE;

export type FileTransferUploadMessage = BaseClientComponentCallUpload<
  typeof FILE_TRANSFER_NAMESPACE,
  'upload-file-demo'
> & {
  fileName: string;
};

export const isFileTransferComponentCallUpload = (
  call: BaseClientComponentCallUpload<string, string>,
  action: string,
): call is FileTransferUploadMessage =>
  call.namespace === FILE_TRANSFER_NAMESPACE && call.action === action;

export type FileTransferDownloadMessage = BaseClientComponentCallDownload<
  typeof FILE_TRANSFER_NAMESPACE,
  'download-file-demo'
> & {
  fileName: string;
};

export const isFileTransferComponentCallDownload = (
  call: BaseClientComponentCallDownload<string, string>,
  action: string,
): call is FileTransferDownloadMessage =>
  call.namespace === FILE_TRANSFER_NAMESPACE && call.action === action;
