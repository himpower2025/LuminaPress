
import React, { useState, useMemo, Fragment, useRef, useEffect } from 'react';
import { Book, ReaderTheme } from '../types';
import { CHARS_PER_PAGE } from '../constants';

// Fix: Define the missing ReaderViewProps interface.
interface ReaderViewProps {
  book: Book;
  onBackToLibrary: () => void;
}

const PageContent: React.FC<{
  content: (string | { type: 'image'; src: string })[];
  theme: ReaderTheme;
  isFlipping?: boolean;
  face?: 'front' | 'back';
}> = ({ content, theme, isFlipping = false, face }) => {
  const themeClasses = {
    [ReaderTheme.Light]: 'bg-white text-gray-800',
    [ReaderTheme.Sepia]: 'bg-sepia text-stone-800',
    [ReaderTheme.Dark]: 'bg-night text-gray-300',
  };

  return (
    <div className={`w-full h-full font-serif text-lg leading-relaxed select-none flex flex-col justify-center p-8 md:p-12 lg:p-16 relative overflow-hidden ${themeClasses[theme]}`}>
      {content.map((element, index) => (
        <Fragment key={index}>
          {typeof element === 'string' ? (
            <p className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>{element}</p>
          ) : (
            <div className="my-4 flex-shrink-0">
              <img src={element.src} alt="Illustration" className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-md" />
            </div>
          )}
        </Fragment>
      ))}
      {isFlipping && face === 'front' && (
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/5 to-transparent pointer-events-none"></div>
      )}
      {isFlipping && face === 'back' && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
};

const ReaderView: React.FC<ReaderViewProps> = ({ book, onBackToLibrary }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [theme, setTheme] = useState<ReaderTheme>(ReaderTheme.Sepia);
  const [showControls, setShowControls] = useState(true);

  const isAnimating = targetPage !== null;
  const direction = isAnimating && targetPage! > currentPage ? 'forward' : 'backward';

  const content = typeof book.content === 'string' ? book.content : '';

  const parsedContent = useMemo(() => {
    const imageRegex = /\[IMAGE:(.*?)\]/g;
    const parts = content.split(imageRegex);
    const elements: (string | { type: 'image', src: string })[] = [];
    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        if (part) elements.push(part);
      } else {
        elements.push({ type: 'image', src: part });
      }
    });
    return elements;
  }, [content]);

  const pages = useMemo(() => {
    let current_page_chars = 0;
    let current_page_content: (string | { type: 'image', src: string })[] = [];
    const resulting_pages: (string | { type: 'image', src: string })[][] = [];

    parsedContent.forEach(element => {
      if (typeof element === 'string') {
        let text_element = element;
        while (text_element.length > 0) {
          const remaining_chars = CHARS_PER_PAGE - current_page_chars;
          if (text_element.length <= remaining_chars) {
            current_page_content.push(text_element);
            current_page_chars += text_element.length;
            text_element = '';
          } else {
            const chunk = text_element.substring(0, remaining_chars);
            current_page_content.push(chunk);
            resulting_pages.push(current_page_content);
            current_page_content = [];
            current_page_chars = 0;
            text_element = text_element.substring(remaining_chars);
          }
        }
      } else {
        if (current_page_content.length > 0) {
          resulting_pages.push(current_page_content);
        }
        resulting_pages.push([element]);
        current_page_content = [];
        current_page_chars = 0;
      }
    });

    if (current_page_content.length > 0) {
      resulting_pages.push(current_page_content);
    }
    
    // Ensure there's always an even number of pages for the spread view
    if (resulting_pages.length % 2 !== 0) {
        resulting_pages.push([]);
    }

    return resulting_pages.length > 0 ? resulting_pages : [['']];
  }, [parsedContent]);
  
  const totalPages = pages.length;

  const goToNextPage = () => {
    if (!isAnimating && currentPage < totalPages - 2) {
      setTargetPage(currentPage + 2);
    }
  };

  const goToPrevPage = () => {
    if (!isAnimating && currentPage > 0) {
      setTargetPage(currentPage - 2);
    }
  };
  
  const handleAnimationEnd = () => {
    if (targetPage !== null) {
      setCurrentPage(targetPage);
      setTargetPage(null);
    }
  };

  const handlePageClick = () => {
    setShowControls(prev => !prev);
  };

  const themeClasses = {
    [ReaderTheme.Light]: 'bg-gray-100',
    [ReaderTheme.Sepia]: 'bg-stone-200',
    [ReaderTheme.Dark]: 'bg-gray-900',
  };

  const getPageContent = (pageIndex: number) => pages[pageIndex] || [];
  
  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-300 ${themeClasses[theme]}`}>
      <header className={`flex items-center justify-between p-4 bg-opacity-80 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : '-translate-y-full'} z-20`}>
         <button onClick={onBackToLibrary} className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <i className="fas fa-arrow-left"></i>
          <span className="font-semibold">Library</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold truncate">{book.title}</h1>
          <p className="text-sm">{book.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(ReaderTheme.Light)} className={`w-6 h-6 rounded-full bg-white border-2 ${theme === ReaderTheme.Light ? 'border-indigo-500' : 'border-gray-400'}`}></button>
          <button onClick={() => setTheme(ReaderTheme.Sepia)} className={`w-6 h-6 rounded-full bg-sepia border-2 ${theme === ReaderTheme.Sepia ? 'border-indigo-500' : 'border-gray-400'}`}></button>
          <button onClick={() => setTheme(ReaderTheme.Dark)} className={`w-6 h-6 rounded-full bg-night border-2 ${theme === ReaderTheme.Dark ? 'border-indigo-500' : 'border-gray-400'}`}></button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center overflow-hidden [perspective:3000px]" onClick={handlePageClick}>
        
        {/* Wrapper for the book itself to establish a positioning context */}
        <div className="relative w-full h-full max-w-6xl shadow-2xl">
          {/* Static book spread */}
          <div className="w-full h-full flex">
            {/* Static Left Page */}
            <div className="w-1/2 h-full">
              <PageContent content={getPageContent(isAnimating && direction === 'backward' ? targetPage! : currentPage)} theme={theme} />
            </div>
            {/* Static Right Page */}
            <div className="w-1/2 h-full">
               <PageContent content={getPageContent(isAnimating && direction === 'forward' ? targetPage! + 1 : currentPage + 1)} theme={theme} />
            </div>
          </div>

          {/* The flipping page, now positioned relative to the book wrapper */}
          {isAnimating && (
            <div
              onAnimationEnd={handleAnimationEnd}
              className={`absolute w-1/2 h-full top-0 [transform-style:preserve-3d]
                ${direction === 'forward' ? 'left-1/2 origin-left animate-page-turn-forward' : 'left-0 origin-right animate-page-turn-backward'}`}
            >
              {/* Front Face of Turning Page */}
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <PageContent content={getPageContent(direction === 'forward' ? currentPage + 1 : currentPage)} theme={theme} isFlipping={true} face="front" />
              </div>
              {/* Back Face of Turning Page */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <PageContent content={getPageContent(direction === 'forward' ? currentPage + 2 : currentPage - 1)} theme={theme} isFlipping={true} face="back" />
              </div>
            </div>
          )}

          {/* Spine effect, also relative to the book wrapper */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black/20 dark:bg-white/20 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-black/50 pointer-events-none" />
        </div>
        
        {/* Click handlers remain relative to the main viewport */}
        {!isAnimating && (
          <>
            <div className="absolute left-0 top-0 h-full w-1/4 group" onClick={(e) => { e.stopPropagation(); goToPrevPage(); }}>
              <div className="flex items-center justify-start pl-4 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-black/10 to-transparent">
                <i className="fas fa-chevron-left text-gray-800 dark:text-white text-3xl drop-shadow-lg"></i>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/4 group" onClick={(e) => { e.stopPropagation(); goToNextPage(); }}>
              <div className="flex items-center justify-end pr-4 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-l from-black/10 to-transparent">
                <i className="fas fa-chevron-right text-gray-800 dark:text-white text-3xl drop-shadow-lg"></i>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className={`p-4 bg-opacity-80 backdrop-blur-sm text-center transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : 'translate-y-full'} z-20`}>
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div
              className="absolute top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${(Math.min(currentPage + 2, totalPages) / totalPages) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {totalPages > 0
              ? pages[currentPage + 1]
                ? `Pages ${currentPage + 1}-${currentPage + 2} of ${totalPages}`
                : `Page ${currentPage + 1} of ${totalPages}`
              : 'Page 1'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReaderView;
