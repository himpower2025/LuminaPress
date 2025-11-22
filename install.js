const fs = require('fs');
const path = require('path');

// 파일 내용 정의
const files = {
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  'metadata.json': `{
  "name": "Lumina Press",
  "description": "Lumina Press: Illuminating stories and ideas. Your personal library for a brighter reading experience.",
  "requestFramePermissions": []
}`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lumina Press</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              serif: ['Georgia', 'Times New Roman', 'serif'],
              sans: ['Inter', 'sans-serif'],
            },
            colors: {
              'cream': '#F5F5DC',
              'sepia': '#FBF0D9',
              'night': '#1a202c',
              'primary': {
                '50': 'var(--color-primary-50)', '100': 'var(--color-primary-100)', '200': 'var(--color-primary-200)', '300': 'var(--color-primary-300)', '400': 'var(--color-primary-400)', '500': 'var(--color-primary-500)', '600': 'var(--color-primary-600)', '700': 'var(--color-primary-700)', '800': 'var(--color-primary-800)', '900': 'var(--color-primary-900)', '950': 'var(--color-primary-950)'
              },
               'secondary': {
                '50': 'var(--color-secondary-50)', '100': 'var(--color-secondary-100)', '200': 'var(--color-secondary-200)', '300': 'var(--color-secondary-300)', '400': 'var(--color-secondary-400)', '500': 'var(--color-secondary-500)', '600': 'var(--color-secondary-600)', '700': 'var(--color-secondary-700)', '800': 'var(--color-secondary-800)', '900': 'var(--color-secondary-900)', '950': 'var(--color-secondary-950)'
              },
            },
            animation: {
              'page-turn-forward': 'page-turn-forward 0.8s ease-in-out forwards',
              'page-turn-backward': 'page-turn-backward 0.8s ease-in-out forwards',
            },
            keyframes: {
              'page-turn-forward': {
                '0%': { transform: 'rotateY(0deg)' },
                '100%': { transform: 'rotateY(-180deg)' },
              },
              'page-turn-backward': {
                '0%': { transform: 'rotateY(0deg)' },
                '100%': { transform: 'rotateY(180deg)' },
              },
            },
          },
        },
      };
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
    <style>
      /* For Webkit-based browsers (Chrome, Safari) */
      .scrollbar-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background: var(--scrollbar-track-color, #f1f1f1);
        border-radius: 10px;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb-color, #888);
        border-radius: 10px;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover-color, #555);
      }
      /* For Firefox */
      .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-thumb-color, #888) var(--scrollbar-track-color, #f1f1f1);
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "uuid": "https://aistudiocdn.com/uuid@^13.0.0",
    "react-icons/": "https://aistudiocdn.com/react-icons@^5.5.0/"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,

  'types.ts': `
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  content: string | ArrayBuffer;
  isUserBook?: boolean;
  price?: string;
  isEpub?: boolean;
}

export enum ReaderTheme {
  Light = 'light',
  Sepia = 'sepia',
  Dark = 'dark',
}

export interface Announcement {
  id:string;
  type: 'popup' | 'notification';
  title: string;
  message: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  requiresPush?: boolean;
}

export interface Gift {
  id: string;
  bookId: string;
  recipientEmail: string;
  message: string;
  date: string;
}

export type PaymentMethod = 'card' | 'points' | 'fonepay';`,

  'constants.ts': `import { Book, Announcement } from './types';

export const CHARS_PER_PAGE = 650;

const luminaPressBooks = [
  {
    id: 'pub-1',
    title: "Moby Dick",
    author: 'Herman Melville',
    coverUrl: 'https://picsum.photos/seed/mobydick/400/600',
    price: '$0.00',
    content: \`Chapter 1: Loomings\\n\\nCall me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball.\\n\\n[IMAGE:https://picsum.photos/seed/mobydick-ship/800/500]\\n\\nWith a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.\`,
    isEpub: false,
  },
  {
    id: 'pub-2',
    title: 'Echoes of Starlight',
    author: 'Kaelen Rourke',
    coverUrl: 'https://picsum.photos/seed/echoesstarlight/400/600',
    price: '$9.99',
    content: \`Prologue\\n\\nFrom the observation deck of the Starship Voyager, the universe was a tapestry of infinite black velvet, sprinkled with the diamond dust of distant galaxies. Commander Eva Rostova gazed at the swirling nebula of Cygnus X-1, her reflection a faint ghost on the reinforced plasteel viewport. Twenty years. Twenty years she had been out here, in the deep void, chasing echoes. The 'Echoes,' as her crew called them, were faint, ghost-like signals that defied all known physics. They were patterns without a source, messages without a sender. Some believed they were the dying breaths of a long-dead civilization. Others, more fancifully, called them the whispers of God.\\n\\n[IMAGE:https://picsum.photos/seed/echoesstarlight-art1/800/500]\\n\\nEva was a scientist. She dealt in data, in proof, in the tangible. But even she couldn't deny the haunting beauty of the signals. They sang a melancholic song of cosmic loneliness, a song that resonated with a place deep inside her she rarely acknowledged. Her mission was simple: find the source. But the journey had been anything but. They had navigated asteroid fields that danced like angry hornets, weathered solar flares that threatened to peel their ship apart, and stared into the maddening abyss of black holes. Through it all, the Echoes were their constant companion, a siren's call leading them deeper into the unknown. Tonight, the signals were stronger than ever. The ship's chief science officer, a young, brilliant man named Jax, confirmed her thoughts. "Commander," his voice crackled over the intercom, "the resonance frequency is off the charts. We're close. Whatever 'it' is, it's just beyond this nebula." Eva took a deep breath, the recycled air tasting of ozone and anticipation. "Take us in, Mr. Jax," she said, her voice steady despite the tremor in her hands. "Let's see who's been singing to us all this time."\`
  },
  { id: 'pub-3', title: 'City of Brass and Fire', author: 'Nadia Al-Farsi', price: '$9.99', coverUrl: 'https://picsum.photos/seed/citybrass/400/600', content: 'A sprawling epic set in a magical city where djinn and humans coexist in a fragile peace. But a dark power is rising, threatening to shatter their world into chaos and flame.' },
  { id: 'pub-4', title: 'The Last Timekeeper', author: 'Simon Glass', price: '$7.99', coverUrl: 'https://picsum.photos/seed/timekeeper/400/600', content: 'In a world where time can be bottled and sold, the last true Timekeeper must protect the Great Clock from a corporation that wants to control the past, present, and future.' },
];

const blueleafBooks = [
    { id: 'bl-1', title: 'The Silent Grove', author: 'Elara Vance', price: '$0.00', coverUrl: 'https://picsum.photos/seed/silentgrove/400/600', content: 'In a forest where trees whisper secrets, a young druid must uncover a plot that threatens to silence the woods forever.'},
    { id: 'bl-2', title: 'River of a Thousand Faces', author: 'Chen Yue', price: '$8.99', coverUrl: 'https://picsum.photos/seed/riverfaces/400/600', content: 'A mystical river grants visions to those who drink from it. A traveling monk seeks its source, hoping to find enlightenment, but discovers the river has a will of its own.'},
    { id: 'bl-3', title: 'The Thorn Witch', author: 'Briar Rosewood', price: '$9.99', coverUrl: 'https://picsum.photos/seed/thornwitch/400/600', content: 'A reclusive witch, protector of a cursed castle, finds her solitude shattered by a knight who believes she holds the key to his redemption.'},
];

const sunstoneBooks = [
    { id: 'ss-1', title: 'Chronicles of the Sunstone', author: 'Aidan Sol', price: '$0.00', coverUrl: 'https://picsum.photos/seed/sunstonechronicles/400/600', content: 'A legendary gem, the Sunstone, is stolen from a desert kingdom, plunging it into eternal twilight. A young warrior must retrieve it from a city of shadows.'},
    { id: 'ss-2', title: 'Crimson Peak', author: 'Rory Scarlett', price: '$12.99', coverUrl: 'https://picsum.photos/seed/crimsonpeak/400/600', content: 'On a volcanic island, an ancient fire god is reawakening. A volcanologist and a local shaman must team up to appease the deity before their home is consumed by lava.'},
    { id: 'ss-3', title: 'The Phoenix Rider', author: 'Ignatius Drake', price: '$10.99', coverUrl: 'https://picsum.photos/seed/phoenixrider/400/600', content: 'Only one rider can bond with the legendary phoenix. The fate of the empire rests on a young orphan who must prove her worth in a deadly tournament.'},
];

[...luminaPressBooks, ...blueleafBooks, ...sunstoneBooks].forEach(book => {
    if (book.id === 'pub-1' || book.id === 'pub-2') return;
    book.content += \`\\n\\nChapter 2: The Journey Begins\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Sorbi in justo.\`;
});


const luminaPressAnnouncements = [
  {
    id: 'announcement-1',
    type: 'popup',
    title: 'New Release: "City of Brass and Fire"',
    message: 'Nadia Al-Farsi\\'s sprawling epic is now available! Dive into a world of djinn, magic, and a fragile peace threatened by a rising dark power. Add it to your library today.',
    imageUrl: 'https://picsum.photos/seed/citybrass/800/400',
    ctaText: 'Add to My Library',
    ctaLink: 'pub-3',
  },
  {
    id: 'announcement-2',
    type: 'notification',
    title: 'Meet the Author: Kaelen Rourke',
    message: 'Join us for a live Q&A with the author of "Echoes of Starlight" this Friday. Don\\'t miss out!',
    ctaText: 'Learn More',
    ctaLink: 'event-1',
  },
  {
    id: 'announcement-3',
    type: 'notification',
    title: 'Limited Time Offer!',
    message: 'Get "The Last Timekeeper" for 50% off this weekend only. Don\\'t miss out!',
    ctaText: 'Claim Offer',
    ctaLink: 'pub-4',
    requiresPush: true,
  }
];

const blueleafAnnouncements = [
  {
    id: 'announcement-bl-1',
    type: 'popup',
    title: 'Discover "The Thorn Witch"',
    message: 'Briar Rosewood\\'s new dark fantasy is here. Explore a cursed castle and a love that blooms like a defiant rose. Get your copy now.',
    imageUrl: 'https://picsum.photos/seed/thornwitch_announce/800/400',
    ctaText: 'Explore the Tale',
    ctaLink: 'bl-3',
  },
];

const sunstoneAnnouncements = [
   {
    id: 'announcement-ss-1',
    type: 'notification',
    title: 'The Phoenix Rider has Arrived!',
    message: 'The most anticipated fantasy novel of the year is finally here. Join the epic journey today!',
    ctaText: 'Buy Now',
    ctaLink: 'ss-3',
  },
];

export const PUBLISHER_DATA = {
  lumina: {
    books: luminaPressBooks,
    announcements: luminaPressAnnouncements,
  },
  blueleaf: {
    books: blueleafBooks,
    announcements: blueleafAnnouncements,
  },
  sunstone: {
    books: sunstoneBooks,
    announcements: sunstoneAnnouncements,
  },
};`,

  'hooks/useLocalStorage.ts': `import React, { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;`,

  'components/BookCover.tsx': `import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaCloudDownloadAlt } from 'react-icons/fa';

const BookCover = ({ book, onActivate, mode }) => {
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
        alt={\`Cover of \${book.title}\`}
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
         <span className={\`absolute top-2 right-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md\`}>
            My Book
         </span>
      )}

      {isLibraryMode && (
        <div className="absolute bottom-2 left-2" title="Available Offline">
          <FaCloudDownloadAlt className="text-white text-opacity-80 text-lg" />
        </div>
      )}
      
      {isStoreMode && book.price && (
        <span className={\`absolute top-2 right-2 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg \${book.price === '$0.00' ? 'bg-blue-600' : 'bg-green-600'}\`}>
          {book.price === '$0.00' ? 'FREE' : book.price}
        </span>
      )}
    </div>
  );
};

export default BookCover;`,

  'components/FileUpload.tsx': `import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';

const FileUpload = ({ onBookUploaded }) => {
  const fileInputRef = useRef(null);
  const { theme } = useTheme();

  const handleFileChange = (event) => {
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
            const content = e.target?.result;
            if (!content || content.byteLength === 0) {
              throw new Error("File is empty or could not be read.");
            }
            const ePubModule = (window).ePub;
            const ePub = ePubModule.default || ePubModule; 
            const epubBook = ePub(content);
            epubBook.loaded.metadata.then(async (metadata) => {
              let coverUrl = \`https://picsum.photos/seed/\${uuidv4()}/400/600\`;
              try {
                const cover = await epubBook.coverUrl();
                if (cover) {
                  coverUrl = cover;
                }
              } catch (err) {
                console.warn("Could not load epub cover", err);
              }

              const newBook = {
                id: uuidv4(),
                title: metadata.title || file.name.replace(/\\.[^/.]+$/, ""),
                author: metadata.creator || 'Unknown Author',
                coverUrl,
                content: content,
                isUserBook: true,
                isEpub: true,
              };
              onBookUploaded(newBook);
            }).catch((err) => {
               console.error("Error parsing EPUB metadata:", err);
               alert(\`Error parsing EPUB metadata: \${err.message}\`);
            });
          } catch(err) {
            console.error("Error loading EPUB:", err);
            alert(\`Error loading EPUB: \${err.message}\`);
          }
        };
        reader.readAsArrayBuffer(file);
      } else { // Handle txt and md
        reader.onload = (e) => {
          const content = e.target?.result;
          const newBook = {
            id: uuidv4(),
            title: file.name.replace(/\\.[^/.]+$/, ""),
            author: 'Unknown Author',
            coverUrl: \`https://picsum.photos/seed/\${uuidv4()}/400/600\`,
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
        className={\`w-full sm:w-auto flex items-center justify-center gap-3 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300\`}
      >
        <i className="fas fa-plus-circle"></i>
        <span>Add Your Book</span>
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Supports .epub, .txt, and .md files.</p>
    </div>
  );
};

export default FileUpload;`,

  'components/LibraryView.tsx': `import React, { useMemo, useState, useRef, useEffect } from 'react';
import BookCover from './BookCover';
import FileUpload from './FileUpload';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { themes } from '../themes';
import AnnouncementPopup from './AnnouncementPopup';
import NotificationToast from './NotificationToast';
import { FaShieldAlt, FaCoins, FaBell, FaBellSlash, FaChevronDown } from 'react-icons/fa';

const LibraryView = ({ 
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

  const [dismissedAnnouncements, setDismissedAnnouncements] = useLocalStorage('dismissed-announcements', []);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isPublisherSwitcherOpen, setIsPublisherSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
        if (switcherRef.current && !switcherRef.current.contains(event.target)) {
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

  const handleDismiss = (id) => {
    setDismissedAnnouncements(prev => [...prev, id]);
  };
  
  const handleCtaClick = (announcement) => {
    const bookToPurchase = allPublisherBooks.find(b => b.id === announcement.ctaLink);
    if (bookToPurchase) {
      onInitiatePurchase(bookToPurchase);
    } else {
      console.log(\`CTA clicked for link: \${announcement.ctaLink}\`);
    }
    handleDismiss(announcement.id);
  };
  
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('Notifications Enabled!', {
          body: \`You will now receive updates from \${theme.appName}.\`,
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
            <Logo className={\`w-10 h-10 text-primary-600\`} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              <span className={\`text-primary-600\`}>{theme.appName.split(' ')[0]}</span>
              <span className="ml-2 hidden sm:inline">{theme.appName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <FaChevronDown className={\`text-gray-500 dark:text-gray-400 transition-transform \${isPublisherSwitcherOpen ? 'rotate-180' : ''}\`} />
          </button>
          {isPublisherSwitcherOpen && (
            <div className="absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-20 p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-3 pt-2 pb-1">Switch Publisher</p>
              {Object.values(themes).map(pTheme => (
                <button
                  key={pTheme.key}
                  onClick={() => { setTheme(pTheme.key); setIsPublisherSwitcherOpen(false); }}
                  className={\`w-full flex items-center gap-4 p-3 text-left rounded-lg transition-colors \${theme.key === pTheme.key ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
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
          <h2 className={\`text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-primary-500 pb-2\`}>My Bookshelf</h2>
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
            <h2 className={\`text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-primary-500 pb-2\`}>Discover from {theme.appName}</h2>
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

export default LibraryView;`,

  'components/ReaderView.tsx': `import React, { useState, useMemo, Fragment } from 'react';
import { CHARS_PER_PAGE } from '../constants';
import { ReaderTheme } from '../types';

const PageContent = ({ content, theme, isFlipping = false, face }) => {
  const themeClasses = {
    [ReaderTheme.Light]: 'bg-white text-gray-800',
    [ReaderTheme.Sepia]: 'bg-sepia text-stone-800',
    [ReaderTheme.Dark]: 'bg-night text-gray-300',
  };

  return (
    <div className={\`w-full h-full font-serif text-lg leading-relaxed select-none flex flex-col justify-center p-8 md:p-12 lg:p-16 relative overflow-hidden \${themeClasses[theme]}\`}>
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

const ReaderView = ({ book, onBackToLibrary }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [targetPage, setTargetPage] = useState(null);
  const [theme, setTheme] = useState(ReaderTheme.Sepia);
  const [showControls, setShowControls] = useState(true);

  const isAnimating = targetPage !== null;
  const direction = isAnimating && targetPage > currentPage ? 'forward' : 'backward';

  const content = typeof book.content === 'string' ? book.content : '';

  const parsedContent = useMemo(() => {
    const imageRegex = /\\[IMAGE:(.*?)\\]/g;
    const parts = content.split(imageRegex);
    const elements = [];
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
    let current_page_content = [];
    const resulting_pages = [];

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

  const getPageContent = (pageIndex) => pages[pageIndex] || [];
  
  return (
    <div className={\`fixed inset-0 flex flex-col transition-colors duration-300 \${themeClasses[theme]}\`}>
      <header className={\`flex items-center justify-between p-4 bg-opacity-80 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-in-out \${showControls ? 'translate-y-0' : '-translate-y-full'} z-20\`}>
         <button onClick={onBackToLibrary} className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <i className="fas fa-arrow-left"></i>
          <span className="font-semibold">Library</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold truncate">{book.title}</h1>
          <p className="text-sm">{book.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(ReaderTheme.Light)} className={\`w-6 h-6 rounded-full bg-white border-2 \${theme === ReaderTheme.Light ? 'border-indigo-500' : 'border-gray-400'}\`}></button>
          <button onClick={() => setTheme(ReaderTheme.Sepia)} className={\`w-6 h-6 rounded-full bg-sepia border-2 \${theme === ReaderTheme.Sepia ? 'border-indigo-500' : 'border-gray-400'}\`}></button>
          <button onClick={() => setTheme(ReaderTheme.Dark)} className={\`w-6 h-6 rounded-full bg-night border-2 \${theme === ReaderTheme.Dark ? 'border-indigo-500' : 'border-gray-400'}\`}></button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center overflow-hidden [perspective:3000px]" onClick={handlePageClick}>
        
        <div className="relative w-full h-full max-w-6xl shadow-2xl">
          <div className="w-full h-full flex">
            <div className="w-1/2 h-full">
              <PageContent content={getPageContent(isAnimating && direction === 'backward' ? targetPage : currentPage)} theme={theme} />
            </div>
            <div className="w-1/2 h-full">
               <PageContent content={getPageContent(isAnimating && direction === 'forward' ? targetPage + 1 : currentPage + 1)} theme={theme} />
            </div>
          </div>

          {isAnimating && (
            <div
              onAnimationEnd={handleAnimationEnd}
              className={\`absolute w-1/2 h-full top-0 [transform-style:preserve-3d]
                \${direction === 'forward' ? 'left-1/2 origin-left animate-page-turn-forward' : 'left-0 origin-right animate-page-turn-backward'}\`}
            >
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <PageContent content={getPageContent(direction === 'forward' ? currentPage + 1 : currentPage)} theme={theme} isFlipping={true} face="front" />
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <PageContent content={getPageContent(direction === 'forward' ? currentPage + 2 : currentPage - 1)} theme={theme} isFlipping={true} face="back" />
              </div>
            </div>
          )}

          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black/20 dark:bg-white/20 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-black/50 pointer-events-none" />
        </div>
        
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

      <footer className={\`p-4 bg-opacity-80 backdrop-blur-sm text-center transition-transform duration-300 ease-in-out \${showControls ? 'translate-y-0' : 'translate-y-full'} z-20\`}>
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div
              className="absolute top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
              style={{ width: \`\${(Math.min(currentPage + 2, totalPages) / totalPages) * 100}%\` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {totalPages > 0
              ? pages[currentPage + 1]
                ? \`Pages \${currentPage + 1}-\${currentPage + 2} of \${totalPages}\`
                : \`Page \${currentPage + 1} of \${totalPages}\`
              : 'Page 1'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReaderView;`,

  'App.tsx': `import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PUBLISHER_DATA } from './constants';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';
import EpubReaderView from './components/EpubReaderView';
import LoginView from './components/LoginView';
import PurchaseModal from './components/PurchaseModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import useLocalStorage from './hooks/useLocalStorage';
import { priceToNumber } from './utils/currency';

const DUMMY_USER = { name: 'Alex Doe', email: 'alex.doe@example.com' };

const ThemedApp = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(\`--color-primary-\${key}\`, value);
    });
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(\`--color-secondary-\${key}\`, value);
    });
  }, [theme]);

  const currentPublisherData = useMemo(() => PUBLISHER_DATA[theme.key], [theme.key]);
  const initialPurchasedBookId = useMemo(() => currentPublisherData.books.find(b => b.price === '$0.00')?.id, [currentPublisherData]);


  const [userBooks, setUserBooks] = useLocalStorage(\`user-uploaded-books-\${theme.key}\`, []);
  const [purchasedBookIds, setPurchasedBookIds] = useLocalStorage(\`purchased-book-ids-\${theme.key}\`, [initialPurchasedBookId].filter(Boolean));
  const [userPoints, setUserPoints] = useLocalStorage('user-points', 2.50); 
  const [gifts, setGifts] = useLocalStorage('user-gifts', []); 
  const [pushedNotificationIds, setPushedNotificationIds] = useLocalStorage('pushed-notification-ids', []);


  const [selectedBook, setSelectedBook] = useState(null);
  const [user, setUser] = useState(null);
  const [purchaseModalState, setPurchaseModalState] = useState({ isOpen: false, book: null });

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
        const firstNewAnnouncement = newPushAnnouncements[0];
        const notification = new Notification(firstNewAnnouncement.title, {
          body: firstNewAnnouncement.message,
          icon: 'https://picsum.photos/seed/luminaicon/192/192',
          tag: firstNewAnnouncement.id,
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

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
  };

  const handleBookUploaded = (newBook) => {
    setUserBooks(prevBooks => [newBook, ...prevBooks]);
  };
  
  const handleInitiatePurchase = (book) => {
    setPurchaseModalState({ isOpen: true, book });
  };
  
  const handleClosePurchaseModal = () => {
    setPurchaseModalState({ isOpen: false, book: null });
  };

  const handleConfirmPurchase = (book, paymentMethod) => {
    if (!purchasedBookIds.includes(book.id)) {
      setPurchasedBookIds(prevIds => [...prevIds, book.id]);
      
      const price = priceToNumber(book.price);
      if (paymentMethod === 'points') {
        setUserPoints(prevPoints => prevPoints - price);
      } else {
        const pointsEarned = price * 0.10;
        setUserPoints(prevPoints => prevPoints + pointsEarned);
      }
    }
    handleClosePurchaseModal();
  };

  const handleConfirmGift = (book, recipientEmail, message, paymentMethod) => {
    const newGift = {
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
    } else {
      const pointsEarned = price * 0.10;
      setUserPoints(prevPoints => prevPoints + pointsEarned);
    }
    
    handleClosePurchaseModal();
    alert(\`Successfully gifted "\${book.title}" to \${recipientEmail}!\`);
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


const App = () => (
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

export default App;`,

  'package.json': `{
  "name": "lumina-press",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "uuid": "^9.0.1",
    "react-icons": "^5.0.1",
    "jszip": "^3.10.1",
    "epubjs": "^0.3.93"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/uuid": "^9.0.8",
    "typescript": "^5.0.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,

  'themes.ts': `import { FaLightbulb, FaFeatherAlt, FaSun } from 'react-icons/fa';

export const luminaPressTheme = {
  key: 'lumina',
  appName: 'Lumina Press',
  logo: FaLightbulb,
  colors: {
    primary: {
      '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f', '950': '#451a03'
    },
    secondary: {
      '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0', '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b', '600': '#475569', '700': '#334155', '800': '#1e293b', '900': '#0f172a', '950': '#020617'
    }
  }
};

export const blueleafBooksTheme = {
  key: 'blueleaf',
  appName: 'Blueleaf Books',
  logo: FaFeatherAlt,
  colors: {
    primary: {
      '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a', '950': '#042f2e'
    },
    secondary: {
      '50': '#f7fee7', '100': '#ecfccb', '200': '#d9f99d', '300': '#bef264', '400': '#a3e635', '500': '#84cc16', '600': '#65a30d', '700': '#4d7c0f', '800': '#3f6212', '900': '#365314', '950': '#1a2e05'
    }
  }
};

export const sunstonePublishingTheme = {
  key: 'sunstone',
  appName: 'Sunstone Publishing',
  logo: FaSun,
  colors: {
    primary: {
      '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519'
    },
    secondary: {
      '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c', '800': '#9a3412', '900': '#7c2d12', '950': '#431407'
    }
  }
};


export const themes = {
  lumina: luminaPressTheme,
  blueleaf: blueleafBooksTheme,
  sunstone: sunstonePublishingTheme,
};`,

  'contexts/ThemeContext.tsx': `import React, { createContext, useState, useContext, useMemo } from 'react';
import { themes, luminaPressTheme } from '../themes';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(luminaPressTheme);

  const setTheme = (themeKey) => {
    const newTheme = themes[themeKey];
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  const value = useMemo(() => ({ theme: currentTheme, setTheme }), [currentTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};`,

  'components/LoginView.tsx': `import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const LoginView = ({ onLogin }) => {
  const { theme } = useTheme();
  const Logo = theme.logo;
  const [mode, setMode] = useState('login');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-500">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo className={\`mx-auto mb-4 w-16 h-16 text-primary-600\`} />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
             {mode === 'login' ? 'Access your personal library.' : 'Begin your reading journey with us.'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                </div>
              )}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="Email" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder={mode === 'login' ? "6-digit PIN" : "Create a 6-digit PIN"} required maxLength={6} pattern="\\d{6}" inputMode="numeric" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
              </div>
              <button type="submit" className={\`w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg\`}>
                {mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className={\`font-semibold text-primary-600 hover:underline\`}>
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
              </div>
            </div>

            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google icon" className="h-6 w-auto" />
              <span>Continue with Google</span>
            </button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>A seamless reading experience awaits.</p>
      </footer>
    </div>
  );
};

export default LoginView;`,

  'components/AnnouncementPopup.tsx': `import React from 'react';

const AnnouncementPopup = ({ announcement, onDismiss, onCtaClick }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ease-out scale-95 hover:scale-100">
        <div className="relative">
          {announcement.imageUrl && (
            <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-48 object-cover rounded-t-xl" />
          )}
          <button
            onClick={() => onDismiss(announcement.id)}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{announcement.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{announcement.message}</p>
          <button
            onClick={() => onCtaClick(announcement)}
            className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
          >
            {announcement.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPopup;`,

  'components/NotificationToast.tsx': `import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const NotificationToast = ({ announcement, onDismiss, onCtaClick }) => {
  const { theme } = useTheme();
  const Logo = theme.logo;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-sm flex items-start gap-4 transform transition-all duration-300 ease-out">
      <div className={\`flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center\`}>
        <Logo className={\`w-6 h-6 text-primary-600 dark:text-primary-300\`} />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{announcement.message}</p>
        <button onClick={() => onCtaClick(announcement)} className={\`mt-2 text-sm font-semibold text-primary-600 hover:underline\`}>
          {announcement.ctaText}
        </button>
      </div>
      <button
        onClick={() => onDismiss(announcement.id)}
        className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default NotificationToast;`,

  'utils/currency.ts': `
export const priceToNumber = (price) => {
  if (!price) return 0;
  return parseFloat(price.replace('$', ''));
};`,

  'components/PurchaseModal.tsx': `import React, { useState, useMemo } from 'react';
import { FaCreditCard, FaCoins, FaCheckCircle, FaGift, FaCcVisa, FaCcMastercard, FaTimes } from 'react-icons/fa';
import { priceToNumber } from '../utils/currency';

const fonepayLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAAANlBMVEX////DAOIAAOzDAOIMDOPKAACvAAB7AADGAACUAADbAABoAADRAADgAABMAADeAAD5AAD8mKxIAAAEeUlEQVR4nO2d65KiMBCG29gYUWBC8v8frQYJk13K6071VXV1Fkx/JslgPz8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA3zLdzy7j7sN7X96X667H+/J6XH6v17PL8uM6v/7d+/L96H8z/t3v667389s8/r3sPrzz5/l+eX4O3//5uWz+s/r8XJ7fjbL/fH5e/r//f37++Wd7f1+X/w/+4fNn8d9O8z/339+X+e/P++3+H+H+l/zfj7/f4339/Pj+/2R/v/7fTf5r8U+fP+9/Nf739/N7/x+K/1/88/v8l5/84eM/f/l/+s/P/83+H+l/zfj7/f4339/Pj+/2R/v/7fTf5r8U+fP+9/Nf739/N7/x+K/1/88/v8l5/84eM/f/l/+s/P/z3f/1+e/zP8/+E/P/83+B/w/+f/v8P/j/+ffP/39+v+/u/gfyf/l/zv+39/9n/yv+f/n//ffP/zfyf/l/zv+39/+h/w/8v/P/+3+b/x/x3/5z/F/0/+N/nf9n9/+p/w/8v/P/+3+b+S/+f/W//X/9v/D3z+4T+T/x3/5z/F/0/+b/nf9n9/+l/w/8v/P/+/+b+a/08e//n/0v+V/O/7f2/+r+S/+f/W//X/8/87/J/8b/C/7/2/+r+S/+f/W//X/+/gfyf/F//4/t/+l/z/i/8l//Of/x/T/83/P/kfkv+N/O/7f+P/W/k//n/lv+b/8n8N/1//P/i//H/W/zX/V+B/x/89/3/8//Wfwn+t/h/8f+z/W/lfkv+t/O/7f+P/W/k//n/lv+b/8n8N/1//P/i//L/Wfyn/X/P//+D/D/+3/e9/8L/n/8n/lf/b/3v8X/i//N/2/4f/2f3L/y/+/fJ/8X/5/9L/lf/b/J/8f+d/W/zv8P+b/1f/n//f5P/x/8b/e/6f9/6D/x/+Z/Jf8H/r/1v/n/5v8H/yv8/+X//7/oP8X/2f/v/2/wf/P/9v8n8n/4/97/J/3/oP/H/5n8l/wf+v/W/+f/g/+T/3P4X/h/2/+3+f/k//H/3v8n/f+g/8f/mfyX/B/6/9b/5/+T/zP+F/gf1v8/+D8r/1/+f/4//7/x/wH/L/+f9f/mfyX/x/53/7/x/wH/L/+f9f/mfyX/x/53/L//38n/Wv6P4v9d//O/lv/T838N//v+X/P/D//T/zP8v97/kv/n/1/+3+f/k/+L/+/2f//+v+D/2f43/d/0f//+3/b/Qf/j/5n8X/y/1//1/yf/F//s/D/9v+3/l/8v/L/83/b/wf/n/2/+3+d/S/5f/v/k//2/b/+3/Z/xf9f/+f/d/o//L/4/+Z/8/+N/O/4f/s/o/+T/xf/P/j/+X/Z/6/+P/x/wz/l/+//5P87/g/+X/2fyX/B/2f8f+v8b/g/+T/3f9n/V/9v83/p/xf9b/u/yfy//N/i//L/j/8f8X/g/8f8v/2f2X/G/0fyT/W//v8P9v8n/g/wL/z/o/i//P/L/8f8f/n/zP4L+K/2//x/2/r//l/y//l//v+z/X/9v+j/+X+L/o/yX/l/+/+X/r/6v8X/w//r/N/rf+X+L/o/yX/l/+/+X/v//L/4n+V/6/2/23/l/k//b/+fzT/r/b/o/+X+L/o/yX/l/+/+X/r/2/+n/+X+L/4f9b/mf9f5P9n//P/L/9v8H/2f17/V/1/+d/+v9n/nf0v+X/p//L/s/6v/X/h/hv9f/T+b/5/1/5v/v9j/V/k/+b/+v9r/J//v/H/W//v8X/D/Bf5//D/T/+/yfyf/2v3/Tf4/+d/+P5L/bf+/2f8P/X+r/o//R/lf/P/0/+R/V/u/wf+r/q/+/8v/L/+/0v97/P/Y/yf9/8n/7/h/9//q/wn+D/+v/q/5/83/X/j/lv+//l/0/83/k/8f+f/z/+T/v/w/q/93/H/R/xf/f+3/Wv+f/n/9v9r/S/+v8v/h/w/+T/b/n/o/hf/f7P+N/T/kf83+n/3/zf87+r/P/x/9v8v/l/l//j/p/4f5f/0/p/+T/5f4f//9t/xf/X/z/9/+z/r/8f5X+f/l/+T/lf+H/X/b/g/+L//f5P4v/N/7//d/1f+f/H/p/hv/f7P+r/xf/L/+3/m/+T/i/4/+D/1f/n/5v/t/m/0v+3+L/nf9f/v/S/x//T/2/7/9f/X/S/xf/v+X/G/1/+P/X/3P4v8D/1/+N/L/Wv+P/i/kf8v/n/z//B/6/wN/P/h/l//b/O/ov/l/lv8f/d/kf8X/H/q/rf/P/+/wv+3/i/8v/V/7fyH/r/L/b/+b/i/8P+v/R/ifkv9l/6/x/yX/3+T/v/F/j/8n+l/y/4f/W/2/o//n/2/m/2X/t/yfyf9//z/T/+/qv/N/gf/b/B/9/+L/9/q/gv/X/h/gf0X/L/3fg/+7/o//9/y/+L+N/wf/p/yf5v9N/nfyv+r/v/f/kv9/+H+9/+/2/5P/H/6/6f/D/4P/v/o/Vv4f/---";

const PurchaseModal = ({ book, userPoints, onClose, onConfirmPurchase, onConfirmGift }) => {
  const [view, setView] = useState('main');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isGifting, setIsGifting] = useState(false);

  const bookPrice = useMemo(() => priceToNumber(book.price), [book.price]);
  const canAffordWithPoints = userPoints >= bookPrice;

  const handlePurchase = () => {
    if (isGifting) {
      // Basic validation
      if (!recipientEmail || !/^\\S+@\\S+\\.\\S+$/.test(recipientEmail)) {
        alert("Please enter a valid recipient email.");
        return;
      }
      onConfirmGift(book, recipientEmail, giftMessage, paymentMethod);
      setView('success_gift');
    } else {
      onConfirmPurchase(book, paymentMethod);
      setView('success_purchase');
    }
  };

  const renderMainView = () => (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Purchase</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">You're about to get a great new book!</p>
      </div>
      <div className="flex gap-6 my-6">
        <img src={book.coverUrl} alt={book.title} className="w-24 h-36 object-cover rounded-md shadow-lg flex-shrink-0" />
        <div className="text-left">
          <h3 className="text-lg font-bold">{book.title}</h3>
          <p className="text-sm text-gray-500">{book.author}</p>
          <p className="text-xl font-extrabold text-primary-600 mt-4">{book.price}</p>
        </div>
      </div>
      <div className="space-y-4">
        <button onClick={() => { setIsGifting(false); setView('pay_options'); }} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
          Buy for Myself
        </button>
        <button onClick={() => { setIsGifting(true); setView('gift'); }} className="w-full flex items-center justify-center gap-2 bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-100 font-bold py-3 px-4 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors">
          <FaGift />
          Send as a Gift
        </button>
      </div>
    </>
  );

  const renderPayOptionsView = () => (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How would you like to pay?</h2>
        <p className="font-bold text-primary-600 text-lg mt-2">{book.price}</p>
      </div>
      <div className="my-6 space-y-4">
        <button onClick={() => setPaymentMethod('card')} className={\`w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all \${paymentMethod === 'card' ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}\`}>
          <div>
            <p className="font-bold">Credit/Debit Card</p>
            <p className="text-xs text-gray-500">Earn { (bookPrice * 0.10).toFixed(2) } points</p>
          </div>
          <div className="flex items-center gap-2 text-2xl text-gray-400">
            <FaCcVisa /> <FaCcMastercard />
          </div>
        </button>
        <button onClick={() => setPaymentMethod('fonepay')} className={\`w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all \${paymentMethod === 'fonepay' ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}\`}>
          <div>
            <p className="font-bold">Fonepay</p>
            <p className="text-xs text-gray-500">Earn { (bookPrice * 0.10).toFixed(2) } points</p>
          </div>
          <img src={fonepayLogo} alt="Fonepay Logo" className="h-8 object-contain" />
        </button>
        <button onClick={() => { if(canAffordWithPoints) setPaymentMethod('points'); }} disabled={!canAffordWithPoints} className={\`w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all \${paymentMethod === 'points' ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'} \${!canAffordWithPoints && 'opacity-50 cursor-not-allowed'}\`}>
          <div>
            <p className="font-bold">Use My Points</p>
            <p className="text-xs text-gray-500">You have {userPoints.toFixed(2)} points</p>
          </div>
          <FaCoins className="text-2xl text-yellow-500" />
        </button>
         {!canAffordWithPoints && (
          <p className="text-xs text-center text-red-500">Not enough points for this purchase.</p>
        )}
      </div>
      <div className="space-y-4">
        <button onClick={handlePurchase} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
          Confirm Purchase
        </button>
        <button onClick={() => isGifting ? setView('gift') : setView('main')} className="w-full text-gray-600 dark:text-gray-300 font-semibold py-2">Back</button>
      </div>
    </>
  );
  
  const renderGiftView = () => (
     <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gift "{book.title}"</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">A thoughtful gift for a fellow reader.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setView('pay_options'); }} className="my-6 space-y-4">
        <div>
          <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient's Email</label>
          <input 
            type="email" 
            id="recipientEmail" 
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="giftMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gift Message (Optional)</label>
          <textarea 
            id="giftMessage" 
            value={giftMessage}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
         <div className="space-y-4 pt-2">
          <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
            Proceed to Payment
          </button>
          <button type="button" onClick={() => setView('main')} className="w-full text-gray-600 dark:text-gray-300 font-semibold py-2">Back</button>
        </div>
      </form>
    </>
  );

  const renderSuccessView = () => (
    <div className="text-center p-8">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isGifting ? 'Gift Sent!' : 'Purchase Successful!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isGifting ? \`"\${book.title}" has been sent to \${recipientEmail}.\` : \`"\${book.title}" has been added to your library.\`}
        </p>
        <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
            Continue Reading
        </button>
    </div>
  );

  const renderContent = () => {
    switch(view) {
      case 'main':
        return renderMainView();
      case 'pay_options':
        return renderPayOptionsView();
      case 'gift':
        return renderGiftView();
      case 'success_purchase':
      case 'success_gift':
        return renderSuccessView();
      default:
        return renderMainView();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
        {view !== 'success_purchase' && view !== 'success_gift' && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={20} />
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default PurchaseModal;`,

  'components/EpubReaderView.tsx': `import React, { useEffect, useRef, useState } from 'react';
import { ReaderTheme } from '../types';
import { FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';


const EpubReaderView = ({ book, onBackToLibrary }) => {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const initialRenderDoneRef = useRef(false);


  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [theme, setTheme] = useState(ReaderTheme.Sepia);
  const [showControls, setShowControls] = useState(true);
  const [location, setLocation] = useState({ currentPage: 1, totalPages: 0 });
  const [isCalculatingPages, setIsCalculatingPages] = useState(false);
  const [error, setError] = useState(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);


  useEffect(() => {
    let isMounted = true;
    initialRenderDoneRef.current = false;

    const keyListener = (e) => {
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
      
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMounted) {
            setError("This book is taking an unusually long time to load. It might be very large or there could be a network issue. Please try again.");
            setIsLoading(false);
        }
      }, 25000); 

      if (!viewerRef.current) return;
      if (!book.content) {
        setError("Book content is missing.");
        setIsLoading(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        return;
      }
      
      const locationCacheKey = \`epub-location:\${book.id}\`;

      try {
        let bookData;
        if (typeof book.content === 'string') {
           setLoadingMessage('Downloading book...');
           const response = await fetch(book.content);
          if (!response.ok) throw new Error(\`Failed to fetch EPUB: \${response.statusText}\`);
          bookData = await response.arrayBuffer();
        } else {
          bookData = book.content;
        }

        if (!isMounted) return;

        const ePubModule = (window).ePub;
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
          }).catch((err) => {
              console.warn("Could not generate book locations:", err);
          }).finally(() => {
              if (isMounted) setIsCalculatingPages(false);
          });
        
        rendition.on('relocated', (locationData) => {
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

      } catch (err) {
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

  const handlePageClick = (e) => {
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
            bookRef.current.spine.items.map((item) => item.load(bookRef.current.load.bind(bookRef.current)).then(() => {
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
  
  const handleSearchResultClick = (cfi) => {
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
    <div className={\`fixed inset-0 flex flex-col transition-colors duration-300 \${themeClasses[theme]}\`}>
      <header className={\`flex items-center justify-between p-4 bg-opacity-80 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-in-out \${showControls ? 'translate-y-0' : '-translate-y-full'} z-30\`}>
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
          <button onClick={() => setTheme(ReaderTheme.Light)} className={\`w-6 h-6 rounded-full bg-white border-2 \${theme === ReaderTheme.Light ? 'border-indigo-500' : 'border-gray-400'}\`}></button>
          <button onClick={() => setTheme(ReaderTheme.Sepia)} className={\`w-6 h-6 rounded-full bg-sepia border-2 \${theme === ReaderTheme.Sepia ? 'border-indigo-500' : 'border-gray-400'}\`}></button>
          <button onClick={() => setTheme(ReaderTheme.Dark)} className={\`w-6 h-6 rounded-full bg-night border-2 \${theme === ReaderTheme.Dark ? 'border-indigo-500' : 'border-gray-400'}\`}></button>
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
                                    <p className="text-sm italic" dangerouslySetInnerHTML={{ __html: result.excerpt.replace(new RegExp(searchQuery, "gi"), (match) => \`<strong class="text-primary-600">\${match}</strong>\`) }}></p>
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

      <footer className={\`p-4 bg-opacity-80 backdrop-blur-sm text-center transition-transform duration-300 ease-in-out \${showControls ? 'translate-y-0' : 'translate-y-full'} z-30\`}>
        <div className="w-full max-w-4xl mx-auto">
          {!isLoading && !error && (
            <>
              {location.totalPages > 0 && (
                 <div className="relative h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      style={{ width: \`\${(location.currentPage / location.totalPages) * 100}%\` }}
                    ></div>
                  </div>
              )}
              <p className="mt-2 text-sm">
                {location.totalPages > 0 
                  ? \`Location \${location.currentPage} of \${location.totalPages}\`
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

export default EpubReaderView;`,
};

// 폴더 생성 및 파일 쓰기 함수
Object.entries(files).forEach(([filePath, content]) => {
  const dir = path.dirname(filePath);
  
  // 디렉토리가 없으면 생성
  if (dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // 파일 쓰기
  fs.writeFileSync(filePath, content.trim());
  console.log(`Created: ${filePath}`);
});

console.log('\\n✨ All files created successfully!');
console.log('👉 Run "npm install" to install dependencies.');
console.log('👉 Run "npm start" to launch the app.');