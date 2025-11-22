
import React, { useEffect, useRef, useState } from 'react';
import { Book, ReaderTheme } from '../types';
import { FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';


interface EpubReaderViewProps {
  book: Book;
  onBackToLibrary: () => void;
}

const EpubReaderView: React.FC<EpubReaderViewProps> = ({ book, onBackToLibrary }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);
  const bookRef = useRef<any>(null);
  const loadingTimeoutRef = useRef<number | null>(null);
  const initialRenderDoneRef = useRef(false);


  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [theme, setTheme] = useState<ReaderTheme>(ReaderTheme.Sepia);
  const [showControls, setShowControls] = useState(true);
  const [location, setLocation] = useState<{ currentPage: number; totalPages: number }>({ currentPage: 1, totalPages: 0 });
  const [isCalculatingPages, setIsCalculatingPages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ cfi: string; excerpt: string }[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);


  useEffect(() => {
    let isMounted = true;
    initialRenderDoneRef.current = false; // Reset for new book

    const keyListener = (e: KeyboardEvent) => {
      if (renditionRef.current) {
        if (e.key === 'ArrowLeft') renditionRef.current.prev();
        if (e.key === 'ArrowRight') renditionRef.current.next();
      }
    };

    const cleanup = () => {
      isMounted = false;
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      document.removeEventListener('keydown', keyListener);
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
      renditionRef.current = null;
      bookRef.current = null;
    };

    const loadBook = async () => {
      if (renditionRef.current) renditionRef.current.destroy();
      if (bookRef.current) bookRef.current.destroy();

      setIsLoading(true);
      setError(null);
      setLocation({ currentPage: 1, totalPages: 0 });
      setLoadingMessage('Initializing Reader...');
      
      // Fix: Use window.setTimeout to ensure it returns a number, explicitly matching the ref type
      loadingTimeoutRef.current = window.setTimeout(() => {
        if (isMounted) {
            setError("This book is taking an unusually long time to load. It might be very large or there could be a network issue. Please try again.");
            setIsLoading(false);
        }
      }, 25000); // 25-second timeout

      if (!viewerRef.current) return;
      if (!book.content) {
        setError("Book content is missing.");
        setIsLoading(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        return;
      }
      
      const locationCacheKey = `epub-location:${book.id}`;

      try {
        let bookData: ArrayBuffer | string;
        if (typeof book.content === 'string') {
           setLoadingMessage('Downloading book...');
           const response = await fetch(book.content);
          if (!response.ok) throw new Error(`Failed to fetch EPUB: ${response.statusText}`);
          bookData = await response.arrayBuffer();
        } else {
          bookData = book.content;
        }

        if (!isMounted) return;

        const ePubModule = (window as any).ePub;
        if (!ePubModule) throw new Error("ePub.js library is not loaded.");
        const ePub = ePubModule.default || ePubModule;
        
        setLoadingMessage('Preparing book...');
        const epubBook = ePub(bookData);
        bookRef.current = epubBook;
        
        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'auto',
        });
        renditionRef.current = rendition;

        // Use the 'rendered' event to know when content is actually on screen
        rendition.on('rendered', () => {
            if (isMounted && !initialRenderDoneRef.current) {
                initialRenderDoneRef.current = true;
                if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                setIsLoading(false);
            }
        });

        rendition.themes.define('light', { body: { 'background': '#FFFFFF', 'color': '#333333', 'font-family': 'Georgia, serif', 'line-height': '1.6' } });
        rendition.themes.define('sepia', { body: { 'background': '#FBF0D9', 'color': '#5b4636', 'font-family': 'Georgia, serif', 'line-height': '1.6' } });
        rendition.themes.define('dark', { body: { 'background': '#1a202c', 'color': '#cbd5e1', 'font-family': 'Georgia, serif', 'line-height': '1.6' } });
        rendition.themes.select(theme);
        
        const savedCfi = localStorage.getItem(locationCacheKey);
        
        // Kick off rendering. The 'rendered' event above will handle hiding the loader.
        rendition.display(savedCfi || undefined);
        
        await epubBook.ready;
        if (!isMounted) return;
        
        setIsCalculatingPages(true);
        await epubBook.locations.generate(1650).then(() => {
              if (!isMounted) return;

              const total = bookRef.current.locations.length();
              setLocation(prev => ({ ...prev, totalPages: total }));

              const current = renditionRef.current.currentLocation();
              if(current) {
                const currentPage = bookRef.current.locations.locationFromCfi(current.start.cfi);
                if (currentPage >= 0) {
                  setLocation(prev => ({ ...prev, currentPage: currentPage + 1 }));
                }
              }
          }).catch((err: any) => {
              console.warn("Could not generate book locations:", err);
          }).finally(() => {
              if (isMounted) setIsCalculatingPages(false);
          });
        
        rendition.on('relocated', (locationData: any) => {
            if (isMounted) {
                const cfi = locationData.start.cfi;
                localStorage.setItem(locationCacheKey, cfi);
                if (bookRef.current?.locations?.length() > 0) {
                    const newCurrentPage = bookRef.current.locations.locationFromCfi(cfi);
                     if (newCurrentPage >= 0) {
                        setLocation(prev => ({ ...prev, currentPage: newCurrentPage + 1 }));
                    }
                }
            }
        });

      } catch (err: any) {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        console.error("Error initializing EPUB:", err);
        if (isMounted) {
            setError(err.message || "Could not initialize the book.");
            setIsLoading(false);
        }
      }
    };
    
    loadBook();
    document.addEventListener('keydown', keyListener);

    return cleanup;
  }, [book]);

  useEffect(() => {
    if (renditionRef.current?.themes) {
      renditionRef.current.themes.select(theme);
    }
  }, [theme]);

  const goToNextPage = () => renditionRef.current?.next();
  const goToPrevPage = () => renditionRef.current?.prev();

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading || error) return;
    setShowControls(prev => !prev);
  };

  const handleSearch = async () => {
    if (!searchQuery || !bookRef.current) return;
    setIsSearchLoading(true);
    setSearchResults([]);
    try {
        await bookRef.current.ready;
        const results = await Promise.all(
            bookRef.current.spine.items.map((item: any) => item.load(bookRef.current.load.bind(bookRef.current)).then(() => {
                return item.find(searchQuery);
            }).finally(() => {
                item.unload();
            }))
        );
        const flattenedResults = [].concat.apply([], results);
        setSearchResults(flattenedResults);
    } catch (err) {
        console.error("Search failed:", err);
    } finally {
        setIsSearchLoading(false);
    }
  };
  
  const handleSearchResultClick = (cfi: string) => {
    renditionRef.current.display(cfi);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  const themeClasses = {
    [ReaderTheme.Light]: 'bg-white text-gray-800',
    [ReaderTheme.Sepia]: 'bg-sepia text-stone-800',
    [ReaderTheme.Dark]: 'bg-night text-gray-300',
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-lg text-center p-4">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p className="font-semibold">{loadingMessage}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This can take a moment for large books.</p>
          <button 
            onClick={onBackToLibrary} 
            className="mt-6 bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-100 font-bold py-2 px-6 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>
      );
    }
    if (error) {
       return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-bold mb-2">Failed to Load Book</h2>
            <p className="text-base">{error}</p>
             <button 
                onClick={onBackToLibrary} 
                className="mt-6 bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
                Back to Library
            </button>
        </div>
      );
    }
    return <div ref={viewerRef} className="w-full h-full" />;
  };

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-300 ${themeClasses[theme]}`}>
      <header className={`flex items-center justify-between p-4 bg-opacity-80 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : '-translate-y-full'} z-30`}>
        <button onClick={onBackToLibrary} className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <i className="fas fa-arrow-left"></i>
          <span className="font-semibold">Library</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold truncate">{book.title}</h1>
          <p className="text-sm">{book.author}</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSearching(true)} className="w-8 h-8 flex items-center justify-center"><FaSearch /></button>
          <button onClick={() => setTheme(ReaderTheme.Light)} className={`w-6 h-6 rounded-full bg-white border-2 ${theme === ReaderTheme.Light ? 'border-indigo-500' : 'border-gray-400'}`}></button>
          <button onClick={() => setTheme(ReaderTheme.Sepia)} className={`w-6 h-6 rounded-full bg-sepia border-2 ${theme === ReaderTheme.Sepia ? 'border-indigo-500' : 'border-gray-400'}`}></button>
          <button onClick={() => setTheme(ReaderTheme.Dark)} className={`w-6 h-6 rounded-full bg-night border-2 ${theme === ReaderTheme.Dark ? 'border-indigo-500' : 'border-gray-400'}`}></button>
        </div>
      </header>

      {isSearching && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-start justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mt-16">
                <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search in book..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-transparent focus:outline-none"
                        autoFocus
                    />
                    <button onClick={() => { setIsSearching(false); setSearchQuery(''); setSearchResults([]); }}><FaTimes /></button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {isSearchLoading ? (
                        <div className="flex items-center justify-center p-8"><FaSpinner className="animate-spin text-2xl" /></div>
                    ) : searchResults.length > 0 ? (
                        <ul className="space-y-2">
                            {searchResults.map((result, index) => (
                                <li key={index} onClick={() => handleSearchResultClick(result.cfi)} className="cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <p className="text-sm italic" dangerouslySetInnerHTML={{ __html: result.excerpt.replace(new RegExp(searchQuery, "gi"), (match) => `<strong class="text-primary-600">${match}</strong>`) }}></p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-center text-gray-500">No results found.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      <main className="flex-grow relative cursor-pointer" onClick={handlePageClick}>
        {renderContent()}
         <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-r from-black/0 via-black/10 to-black/0 pointer-events-none" />
          {!isLoading && !error && (
            <>
              <div className="absolute left-0 top-0 h-full w-1/4 group" onClick={(e) => { e.stopPropagation(); goToPrevPage(); }}>
                <div className="flex items-center justify-start pl-4 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-black/10 to-transparent">
                  <FaChevronLeft className="text-gray-800 dark:text-white text-3xl drop-shadow-lg" />
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/4 group" onClick={(e) => { e.stopPropagation(); goToNextPage(); }}>
                <div className="flex items-center justify-end pr-4 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-l from-black/10 to-transparent">
                  <FaChevronRight className="text-gray-800 dark:text-white text-3xl drop-shadow-lg" />
                </div>
              </div>
            </>
          )}
      </main>

      <footer className={`p-4 bg-opacity-80 backdrop-blur-sm text-center transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : 'translate-y-full'} z-30`}>
        <div className="w-full max-w-4xl mx-auto">
          {!isLoading && !error && (
            <>
              {location.totalPages > 0 && (
                 <div className="relative h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      style={{ width: `${(location.currentPage / location.totalPages) * 100}%` }}
                    ></div>
                  </div>
              )}
              <p className="mt-2 text-sm">
                {location.totalPages > 0 
                  ? `Location ${location.currentPage} of ${location.totalPages}`
                  : (isCalculatingPages ? 'Calculating pages...' : 'Page 1')
                }
              </p>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default EpubReaderView;
