
import React from 'react';
import { Announcement } from '../types';

interface AnnouncementPopupProps {
  announcement: Announcement;
  onDismiss: (id: string) => void;
  onCtaClick: (announcement: Announcement) => void;
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ announcement, onDismiss, onCtaClick }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out flex flex-col max-h-[90vh] overflow-hidden">
        <div className="relative flex-shrink-0">
          {announcement.imageUrl && (
            <img 
              src={announcement.imageUrl} 
              alt={announcement.title} 
              className="w-full h-32 sm:h-48 object-cover" 
            />
          )}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <button
            onClick={() => onDismiss(announcement.id)}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-sm"
            aria-label="Close"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{announcement.title}</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{announcement.message}</p>
          <button
            onClick={() => onCtaClick(announcement)}
            className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform active:scale-[0.98]"
          >
            {announcement.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
