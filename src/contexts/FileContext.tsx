
import { createContext, useContext, useState, ReactNode } from "react";

interface FileContextType {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  clearFiles: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const addFiles = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <FileContext.Provider
      value={{
        uploadedFiles,
        setUploadedFiles,
        addFiles,
        clearFiles
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}
