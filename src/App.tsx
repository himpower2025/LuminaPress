import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Book, Gift, PaymentMethod } from './types';
import { PUBLISHER_DATA } from './constants';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';
import EpubReaderView from './components/EpubReaderView';
import LoginView from './components/LoginView';
import PurchaseModal from './components/PurchaseModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import useLocalStorage from './hooks/useLocalStorage';
import { priceToNumber } from './utils/currency';

// Dummy user object for simulation
const DUMMY_USER = { name: 'Alex Doe', email: 'alex.doe@example.com' };

const ThemedApp: React.FC = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
  }, [theme]);

  const currentPublisherData = useMemo(() => PUBLISHER_DATA[theme.key], [theme.key]);
  const initialPurchasedBookId = useMemo(() => currentPublisherData.books.find(b => b.price === '$0.00')?.id, [currentPublisherData]);


  const [userBooks, setUserBooks] = useLocalStorage<Book[]>(`user-uploaded-books-${theme.key}`, []);
  const [purchasedBookIds, setPurchasedBookIds] = useLocalStorage<string[]>(`purchased-book-ids-${theme.key}`, [initialPurchasedBookId].filter(Boolean) as string[]);
  const [userPoints, setUserPoints] = useLocalStorage<number>('user-points', 2.50); // Global points
  const [gifts, setGifts] = useLocalStorage<Gift[]>('user-gifts', []); // Global gifts
  const [pushedNotificationIds, setPushedNotificationIds] = useLocalStorage<string[]>('pushed-notification-ids', []);


  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [user, setUser] = useState<typeof DUMMY_USER | null>(null);
  const [purchaseModalState, setPurchaseModalState] = useState<{isOpen: boolean; book: Book | null}>({ isOpen: false, book: null });

  const libraryBooks = useMemo(() => {
    const purchasedPublisherBooks = currentPublisherData.books.filter(book => purchasedBookIds.includes(book.id));
    return [...userBooks, ...purchasedPublisherBooks].sort((a, b) => a.title.localeCompare(b.title));
  }, [userBooks, purchasedBookIds, currentPublisherData]);

  const storeBooks = useMemo(() => {
    return currentPublisherData.books.filter(book => !purchasedBookIds.includes(book.id));
  }, [purchasedBookIds, currentPublisherData]);
  
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'granted') {
      const newPushAnnouncements = currentPublisherData.announcements.filter(a => 
        a.requiresPush && !pushedNotificationIds.includes(a.id)
      );

      if (newPushAnnouncements.length > 0) {
        // To avoid being spammy, we'll show one notification on load for the first new announcement
        // but mark all new ones as "pushed".
        const firstNewAnnouncement = newPushAnnouncements[0];
        const notification = new Notification(firstNewAnnouncement.title, {
          body: firstNewAnnouncement.message,
          icon: 'https://picsum.photos/seed/luminaicon/192/192', // A generic icon for simulation
          tag: firstNewAnnouncement.id, // Tag prevents duplicate notifications for the same announcement
        });
        
        notification.onclick = () => {
           window.focus();
        };

        setPushedNotificationIds(prev => [
          ...prev, 
          ...newPushAnnouncements.map(a => a.id)
        ]);
      }
    }
  }, [user, pushedNotificationIds, setPushedNotificationIds, currentPublisherData]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
  };

  const handleBookUploaded = (newBook: Book) => {
    setUserBooks(prevBooks => [newBook, ...prevBooks]);
  };
  
  const handleInitiatePurchase = (book: Book) => {
    setPurchaseModalState({ isOpen: true, book });
  };
  
  const handleClosePurchaseModal = () => {
    setPurchaseModalState({ isOpen: false, book: null });
  };

  const handleConfirmPurchase = (book: Book, paymentMethod: PaymentMethod) => {
    if (!purchasedBookIds.includes(book.id)) {
      setPurchasedBookIds(prevIds => [...prevIds, book.id]);
      
      const price = priceToNumber(book.price);
      if (paymentMethod === 'points') {
        setUserPoints(prevPoints => prevPoints - price);
      } else { // card or fonepay
        const pointsEarned = price * 0.10;
        setUserPoints(prevPoints => prevPoints + pointsEarned);
      }
    }
    handleClosePurchaseModal();
  };

  const handleConfirmGift = (book: Book, recipientEmail: string, message: string, paymentMethod: PaymentMethod) => {
    const newGift: Gift = {
      id: uuidv4(),
      bookId: book.id,
      recipientEmail,
      message,
      date: new Date().toISOString(),
    };
    setGifts(prev => [newGift, ...prev]);

    const price = priceToNumber(book.price);
    if (paymentMethod === 'points') {
      setUserPoints(prevPoints => prevPoints - price);
    } else { // card or fonepay
      const pointsEarned = price * 0.10;
      setUserPoints(prevPoints => prevPoints + pointsEarned);
    }
    
    handleClosePurchaseModal();
    // In a real app, an email would be sent here.
    alert(`Successfully gifted "${book.title}" to ${recipientEmail}!`);
  };


  const handleLogin = () => {
    setUser(DUMMY_USER);
  };

  const handleLogout = () => {
    setUser(null);
  }
  
  if (selectedBook) {
    if (selectedBook.isEpub) {
      return <EpubReaderView book={selectedBook} onBackToLibrary={handleBackToLibrary} />;
    }
    return <ReaderView book={selectedBook} onBackToLibrary={handleBackToLibrary} />;
  }
  
  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <>
      <LibraryView 
        libraryBooks={libraryBooks}
        storeBooks={storeBooks}
        allPublisherBooks={currentPublisherData.books}
        announcements={currentPublisherData.announcements}
        userPoints={userPoints}
        onSelectBook={handleSelectBook} 
        onInitiatePurchase={handleInitiatePurchase}
        onBookUploaded={handleBookUploaded}
        onLogout={handleLogout}
      />
      {purchaseModalState.isOpen && purchaseModalState.book && (
        <PurchaseModal
          book={purchaseModalState.book}
          userPoints={userPoints}
          onClose={handleClosePurchaseModal}
          onConfirmPurchase={handleConfirmPurchase}
          onConfirmGift={handleConfirmGift}
        />
      )}
    </>
  );
};


const App: React.FC = () => (
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

export default App;