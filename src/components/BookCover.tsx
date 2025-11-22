
import React from 'react';
import { Book } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { FaCloudDownloadAlt } from 'react-icons/fa';

interface BookCoverProps {
  book: Book;
  onActivate: (book: Book) => void;
  mode: 'library' | 'store';
}

const BookCover: React.FC<BookCoverProps> = ({ book, onActivate, mode }) => {
  const { theme } = useTheme();
  const isStoreMode = mode === 'store';
  const isLibraryMode = mode === 'library';
  const actionText = isStoreMode ? 'View Details' : 'Read Now';

  return (
    <div
      className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-lg h-full flex flex-col"
      onClick={() => onActivate(book)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onActivate(book)}
    >
      <img
        src={book.coverUrl}
        alt={`Cover of ${book.title}`}
        className="w-full h-auto object-cover rounded-lg shadow-lg group-hover:shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300 ease-in-out flex-grow"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 rounded-lg transition-opacity duration-300">
        <h3 className="text-white font-bold text-base leading-tight">{book.title}</h3>
        <p className="text-gray-300 text-xs">{book.author}</p>
        {isStoreMode && (
          <div className="mt-2 bg-white text-gray-800 text-center rounded-md py-1 px-2 font-bold text-xs shadow-lg transform group-hover:scale-105 transition-transform">
            <i className="fas fa-shopping-cart mr-1"></i> {actionText}
          </div>
        )}
      </div>
      
      {book.isUserBook && isLibraryMode && (
         <span className={`absolute top-2 right-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md`}>
            My Book
         </span>
      )}

      {isLibraryMode && (
        <div className="absolute bottom-2 left-2" title="Available Offline">
          <FaCloudDownloadAlt className="text-white text-opacity-80 text-lg" />
        </div>
      )}
      
      {isStoreMode && book.price && (
        <span className={`absolute top-2 right-2 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg ${book.price === '$0.00' ? 'bg-blue-600' : 'bg-green-600'}`}>
          {book.price === '$0.00' ? 'FREE' : book.price}
        </span>
      )}
    </div>
  );
};

export default BookCover;
