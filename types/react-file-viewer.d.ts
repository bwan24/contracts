declare module 'react-file-viewer' {
  import React from 'react';

  interface FileViewerProps {
    fileType: string;
    filePath: string;
    errorComponent?: React.ReactNode;
    onError?: (error: Error) => void;
    customErrorComponent?: React.ReactNode;
    unsupportedComponent?: React.ReactNode;
  }

  const FileViewer: React.ComponentType<FileViewerProps>;
  export default FileViewer;
}