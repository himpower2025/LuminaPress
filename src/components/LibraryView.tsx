
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Book, Announcement } from '../types';
import BookCover from './BookCover';
import FileUpload from './FileUpload';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { themes } from '../themes';
import AnnouncementPopup from './AnnouncementPopup';
import NotificationToast from './NotificationToast';
import { FaShieldAlt, FaCoins, FaBell, FaBellSlash, FaChevronDown, FaDownload, FaBars, FaSignOutAlt } from 'react-icons/fa';

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
  const { theme, setTheme, iconUrl } = useTheme();
  const Logo = theme.logo;

  const [dismissedAnnouncements, setDismissedAnnouncements] = useLocalStorage<string[]>('dismissed-announcements', []);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isPublisherSwitcherOpen, setIsPublisherSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
       {/* Announcements Section - Popup Modal */}
      {popupAnnouncement && (
        <AnnouncementPopup 
          announcement={popupAnnouncement} 
          onDismiss={handleDismiss}
          onCtaClick={handleCtaClick}
        />
      )}
      
      {/* Notifications - Moved to Bottom Right to avoid blocking header */}
      <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm space-y-4 px-4 sm:px-0 pointer-events-none">
        {notificationAnnouncements.map(announcement => (
          <div className="pointer-events-auto" key={announcement.id}>
             <NotificationToast 
                announcement={announcement}
                onDismiss={handleDismiss}
                onCtaClick={handleCtaClick}
              />
          </div>
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


      {/* Header Section */}
      <header className="flex justify-between items-center mb-6 sm:mb-8 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-2 z-30">
        <div className="relative" ref={switcherRef}>
          <button onClick={() => setIsPublisherSwitcherOpen(o => !o)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Logo className={`w-8 h-8 sm:w-9 sm:h-9 text-primary-600`} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight hidden sm:block">
              <span className={`text-primary-600`}>{theme.appName.split(' ')[0]}</span>
              {theme.appName.split(' ').length > 1 && <span className="ml-1.5">{theme.appName.split(' ').slice(1).join(' ')}</span>}
            </h1>
            <FaChevronDown className={`text-gray-400 dark:text-gray-500 transition-transform text-xs sm:text-sm ml-1 ${isPublisherSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isPublisherSwitcherOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-20 p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-3 pt-2 pb-1">Switch Publisher</p>
              {Object.values(themes).map(pTheme => (
                <button
                  key={pTheme.key}
                  onClick={() => { setTheme(pTheme.key); setIsPublisherSwitcherOpen(false); }}
                  className={`w-full flex items-center gap-4 p-3 text-left rounded-lg transition-colors ${theme.key === pTheme.key ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <pTheme.logo className="w-6 h-6 flex-shrink-0" style={{ color: pTheme.colors.primary['500'] }} />
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{pTheme.appName}</span>
                    {theme.key === pTheme.key && <div className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 mt-0.5">Selected</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Points Display - Always Visible */}
          <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-bold py-1.5 px-3 rounded-full text-sm">
            <FaCoins className="text-yellow-600 dark:text-yellow-400" />
            <span>{userPoints.toFixed(2)}</span>
          </div>

          {/* Desktop Actions (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3">
             {notificationPermission === 'default' && (
              <button onClick={handleRequestNotificationPermission} className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2.5 rounded-full transition-colors" title="Enable Notifications">
                  <FaBell />
              </button>
            )}
            {notificationPermission === 'denied' && (
              <div className="relative group flex items-center">
                <button className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 p-2.5 rounded-full cursor-not-allowed" title="Notifications Blocked" disabled>
                  <FaBellSlash />
                </button>
              </div>
            )}
             <button onClick={() => setIsAdminPanelOpen(true)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Admin Panel">
              <FaShieldAlt /> <span className="hidden lg:inline">Admin</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 font-bold py-2 px-4 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaBars size={20} />
          </button>
        </div>
      </header>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 space-y-3 animate-fade-in-down">
           {notificationPermission === 'default' && (
              <button onClick={handleRequestNotificationPermission} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full text-primary-600"><FaBell /></div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Enable Notifications</span>
              </button>
            )}
             <button onClick={() => { setIsAdminPanelOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300"><FaShieldAlt /></div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Admin Panel</span>
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400 group-hover:bg-red-200"><FaSignOutAlt /></div>
                <span className="font-semibold text-red-600 dark:text-red-400">Logout</span>
            </button>
        </div>
      )}
      
      <FileUpload onBookUploaded={onBookUploaded} />

      <main className="max-w-7xl mx-auto space-y-12 mt-8">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-primary-500 pb-2`}>My Bookshelf</h2>
          {libraryBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {libraryBooks.map((book) => (
                <BookCover key={book.id} book={book} onActivate={onSelectBook} mode="library" />
              ))}
            </div>
          ) : (
             <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-3xl text-gray-400 dark:text-gray-500"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Your Bookshelf is Empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base px-4">Upload a book or add one from the store below!</p>
            </div>
          )}
        </div>

        {storeBooks.length > 0 && (
          <div>
            <h2 className={`text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-primary-500 pb-2`}>Discover from {theme.appName}</h2>
            <div className="flex space-x-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-gray-100">
              {storeBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-36 sm:w-44 md:w-48 transition-transform hover:scale-105 duration-300">
                   <BookCover book={book} onActivate={onInitiatePurchase} mode="store" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="text-center mt-12 py-8 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
        <p className="mb-3">Created with <i className="fas fa-heart text-red-500 mx-1"></i> for avid readers.</p>
        {iconUrl && (
            <a href={iconUrl} download="app-icon.svg" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
               <FaDownload /> Download App Icon
            </a>
        )}
      </footer>
    </div>
  );
};

export default LibraryView;
