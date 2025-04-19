
import { createContext, useContext, useState, ReactNode } from "react";

interface DocumentContent {
  file: File;
  content: string;
}

interface FileContextType {
  uploadedFiles: File[];
  documentContents: DocumentContent[];
  setUploadedFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  addDocumentContent: (file: File, content: string) => void;
  clearFiles: () => void;
  getDocumentContent: (filename: string) => string | null;
  getAllDocumentContents: () => string[];
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentContents, setDocumentContents] = useState<DocumentContent[]>([]);

  const addFiles = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const addDocumentContent = (file: File, content: string) => {
    setDocumentContents(prev => [
      ...prev.filter(doc => doc.file.name !== file.name),
      { file, content }
    ]);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setDocumentContents([]);
  };

  const getDocumentContent = (filename: string): string | null => {
    const doc = documentContents.find(doc => doc.file.name === filename);
    return doc ? doc.content : null;
  };

  const getAllDocumentContents = (): string[] => {
    return documentContents.map(doc => doc.content);
  };

  return (
    <FileContext.Provider
      value={{
        uploadedFiles,
        documentContents,
        setUploadedFiles,
        addFiles,
        addDocumentContent,
        clearFiles,
        getDocumentContent,
        getAllDocumentContents
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
