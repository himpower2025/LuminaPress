
import React from 'react';
import { Announcement } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationToastProps {
  announcement: Announcement;
  onDismiss: (id: string) => void;
  onCtaClick: (announcement: Announcement) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ announcement, onDismiss, onCtaClick }) => {
  const { theme } = useTheme();
  const Logo = theme.logo;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-sm flex items-start gap-4 transform transition-all duration-300 ease-out">
      <div className={`flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center`}>
        <Logo className={`w-6 h-6 text-primary-600 dark:text-primary-300`} />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{announcement.message}</p>
        <button onClick={() => onCtaClick(announcement)} className={`mt-2 text-sm font-semibold text-primary-600 hover:underline`}>
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

export default NotificationToast;
