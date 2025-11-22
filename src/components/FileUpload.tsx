
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Book } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface FileUploadProps {
  onBookUploaded: (book: Book) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onBookUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedExtensions = /(\.txt|\.md|\.epub)$/i;
      if (!allowedExtensions.exec(file.name)) {
        alert('Invalid file type. Please upload a .txt, .md, or .epub file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const reader = new FileReader();

      if (file.name.toLowerCase().endsWith('.epub')) {
        reader.onload = (e) => {
          try {
            const content = e.target?.result as ArrayBuffer;
            if (!content || content.byteLength === 0) {
              throw new Error("File is empty or could not be read.");
            }
            const ePubModule = (window as any).ePub;
            const ePub = ePubModule.default || ePubModule; // Handle cases where it's wrapped in a default export
            const epubBook = ePub(content);
            epubBook.loaded.metadata.then(async (metadata: any) => {
              let coverUrl = `https://picsum.photos/seed/${uuidv4()}/400/600`;
              try {
                const cover = await epubBook.coverUrl();
                if (cover) {
                  coverUrl = cover;
                }
              } catch (err) {
                console.warn("Could not load epub cover", err);
              }

              const newBook: Book = {
                id: uuidv4(),
                title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                author: metadata.creator || 'Unknown Author',
                coverUrl,
                content: content,
                isUserBook: true,
                isEpub: true,
              };
              onBookUploaded(newBook);
            }).catch((err: any) => {
               console.error("Error parsing EPUB metadata:", err);
               alert(`Error parsing EPUB metadata: ${err.message}`);
            });
          } catch(err: any) {
            console.error("Error loading EPUB:", err);
            alert(`Error loading EPUB: ${err.message}`);
          }
        };
        reader.readAsArrayBuffer(file);
      } else { // Handle txt and md
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newBook: Book = {
            id: uuidv4(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            author: 'Unknown Author',
            coverUrl: `https://picsum.photos/seed/${uuidv4()}/400/600`,
            content: content,
            isUserBook: true,
            isEpub: false,
          };
          onBookUploaded(newBook);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.epub"
      />
      <button
        onClick={handleClick}
        className={`w-full sm:w-auto flex items-center justify-center gap-3 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300`}
      >
        <i className="fas fa-plus-circle"></i>
        <span>Add Your Book</span>
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Supports .epub, .txt, and .md files.</p>
    </div>
  );
};

export default FileUpload;
