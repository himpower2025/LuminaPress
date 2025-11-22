
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Book, Announcement } from '../types';
import BookCover from './BookCover';
import FileUpload from './FileUpload';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { themes } from '../themes';
import AnnouncementPopup from './AnnouncementPopup';
import NotificationToast from './NotificationToast';
import { FaShieldAlt, FaCoins, FaBell, FaBellSlash, FaChevronDown } from 'react-icons/fa';

interface LibraryViewProps {
  libraryBooks: Book[];
  storeBooks: Book[];
  allPublisherBooks: Book[];
  announcements: Announcement[];
  userPoints: number;
  onSelectBook: (book: Book) => void;
  onInitiatePurchase: (book: Book) => void;
  onBookUploaded: (book: Book) => void;
  onLogout: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
  libraryBooks, 
  storeBooks, 
  allPublisherBooks,
  announcements,
  userPoints, 
  onSelectBook, 
  onInitiatePurchase, 
  onBookUploaded, 
  onLogout 
}) => {
  const { theme, setTheme } = useTheme();
  const Logo = theme.logo;

  const [dismissedAnnouncements, setDismissedAnnouncements] = useLocalStorage<string[]>('dismissed-announcements', []);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isPublisherSwitcherOpen, setIsPublisherSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
            setIsPublisherSwitcherOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [switcherRef]);

  const activeAnnouncements = useMemo(() => 
    announcements.filter(a => !dismissedAnnouncements.includes(a.id)),
    [announcements, dismissedAnnouncements]
  );

  const popupAnnouncement = useMemo(() => 
    activeAnnouncements.find(a => a.type === 'popup'),
    [activeAnnouncements]
  );
  
  const notificationAnnouncements = useMemo(() =>
    activeAnnouncements.filter(a => a.type === 'notification'),
    [activeAnnouncements]
  );

  const handleDismiss = (id: string) => {
    setDismissedAnnouncements(prev => [...prev, id]);
  };
  
  const handleCtaClick = (announcement: Announcement) => {
    const bookToPurchase = allPublisherBooks.find(b => b.id === announcement.ctaLink);
    if (bookToPurchase) {
      onInitiatePurchase(bookToPurchase);
    } else {
      console.log(`CTA clicked for link: ${announcement.ctaLink}`);
    }
    handleDismiss(announcement.id);
  };
  
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('Notifications Enabled!', {
          body: `You will now receive updates from ${theme.appName}.`,
          icon: 'https://picsum.photos/seed/luminaicon/192/192',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 lg:p-8">
       {/* Announcements Section */}
      {popupAnnouncement && (
        <AnnouncementPopup 
          announcement={popupAnnouncement} 
          onDismiss={handleDismiss}
          onCtaClick={handleCtaClick}
        />
      )}
      <div className="fixed top-4 right-4 z-40 w-full max-w-sm space-y-4">
        {notificationAnnouncements.map(announcement => (
          <NotificationToast 
            key={announcement.id}
            announcement={announcement}
            onDismiss={handleDismiss}
            onCtaClick={handleCtaClick}
          />
        ))}
      </div>
      
       {isAdminPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
             <div className="p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel (Simulation)</h2>
                   <button onClick={() => setIsAdminPanelOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Total Revenue:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">$1,234.56</span>
                  </div>
                  <div className="flex justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Books Sold:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">128</span>
                  </div>
                   <div className="flex justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Active Users:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">42</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}


      <header className="flex justify-between items-center mb-8">
        <div className="relative" ref={switcherRef}>
          <button onClick={() => setIsPublisherSwitcherOpen(o => !o)} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Logo className={`w-10 h-10 text-primary-600`} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              <span className={`text-primary-600`}>{theme.appName.split(' ')[0]}</span>
              <span className="ml-2 hidden sm:inline">{theme.appName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <FaChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${isPublisherSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>
          {isPublisherSwitcherOpen && (
            <div className="absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-20 p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-3 pt-2 pb-1">Switch Publisher</p>
              {Object.values(themes).map(pTheme => (
                <button
                  key={pTheme.key}
                  onClick={() => { setTheme(pTheme.key); setIsPublisherSwitcherOpen(false); }}
                  className={`w-full flex items-center gap-4 p-3 text-left rounded-lg transition-colors ${theme.key === pTheme.key ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <pTheme.logo className="w-8 h-8 flex-shrink-0" style={{ color: pTheme.colors.primary['500'] }} />
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{pTheme.appName}</span>
                    {theme.key === pTheme.key && <span className="text-xs text-primary-600 dark:text-primary-400 ml-2">Currently Selected</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 font-bold py-2 px-4 rounded-lg">
            <FaCoins />
            <span>{userPoints.toFixed(2)}</span>
          </div>
           {notificationPermission === 'default' && (
            <button onClick={handleRequestNotificationPermission} className="hidden sm:flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Enable Notifications">
                <FaBell />
            </button>
          )}
          {notificationPermission === 'denied' && (
            <div className="relative group hidden sm:flex items-center">
              <button className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed" title="Notifications Blocked" disabled>
                <FaBellSlash />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Notifications are blocked.
                <br />
                Check your browser settings.
              </div>
            </div>
          )}
           <button onClick={() => setIsAdminPanelOpen(true)} className="hidden sm:flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Admin Panel">
            <FaShieldAlt /> <span className="hidden lg:inline">Admin</span>
          </button>
          <button onClick={onLogout} className="bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-100 font-bold py-2 px-4 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors">
            Logout
          </button>
        </div>
      </header>
      
      <FileUpload onBookUploaded={onBookUploaded} />

      <main className="max-w-7xl mx-auto space-y-12 mt-8">
        <div>
          <h2 className={`text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-primary-500 pb-2`}>My Bookshelf</h2>
          {libraryBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {libraryBooks.map((book) => (
                <BookCover key={book.id} book={book} onActivate={onSelectBook} mode="library" />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
                <i className="fas fa-book-open text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Your Bookshelf is Empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Upload a book or add one from the store below!</p>
            </div>
          )}
        </div>

        {storeBooks.length > 0 && (
          <div>
            <h2 className={`text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-primary-500 pb-2`}>Discover from {theme.appName}</h2>
            <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-gray-100">
              {storeBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-40 sm:w-48">
                   <BookCover book={book} onActivate={onInitiatePurchase} mode="store" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="text-center mt-12 py-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>Created with <i className="fas fa-heart text-red-500"></i> for avid readers.</p>
      </footer>
    </div>
  );
};

export default LibraryView;
