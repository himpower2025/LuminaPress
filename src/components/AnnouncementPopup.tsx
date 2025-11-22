
import React from 'react';
import { Announcement } from '../types';

interface AnnouncementPopupProps {
  announcement: Announcement;
  onDismiss: (id: string) => void;
  onCtaClick: (announcement: Announcement) => void;
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ announcement, onDismiss, onCtaClick }) => {
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

export default AnnouncementPopup;
