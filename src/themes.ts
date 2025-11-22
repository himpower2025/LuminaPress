import React from 'react';
import { FaLightbulb, FaFeatherAlt, FaSun } from 'react-icons/fa';

export interface Theme {
  key: string;
  appName: string;
  logo: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  colors: {
    primary: {
      '50': string; '100': string; '200': string; '300': string; '400': string; '500': string; '600': string; '700': string; '800': string; '900': string; '950': string;
    };
    secondary: {
      '50': string; '100': string; '200': string; '300': string; '400': string; '500': string; '600': string; '700': string; '800': string; '900': string; '950': string;
    };
  };
}

export const luminaPressTheme: Theme = {
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

export const blueleafBooksTheme: Theme = {
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

export const sunstonePublishingTheme: Theme = {
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


export const themes: Record<string, Theme> = {
  lumina: luminaPressTheme,
  blueleaf: blueleafBooksTheme,
  sunstone: sunstonePublishingTheme,
};