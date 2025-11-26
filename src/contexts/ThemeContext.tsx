
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  downloadAppIcon: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to generate icon from SVG Path Data directly on Canvas
// This eliminates the "Image Loading" step which causes invisible icons.
const generateIconFromPath = (pathData: string, size: number, backgroundColor: string, iconColor: string = '#FFFFFF'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  // 1. Draw Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // 2. Setup Vector Drawing
  // FontAwesome paths are typically defined on a 0-512 viewbox.
  // We need to scale this to our target canvas size with some padding.
  const padding = size * 0.2; // 20% padding
  const drawSize = size - (padding * 2);
  const scale = drawSize / 512; 

  ctx.translate(padding, padding);
  ctx.scale(scale, scale);

  // 3. Draw the Path
  const p = new Path2D(pathData);
  ctx.fillStyle = iconColor;
  ctx.fill(p);

  return canvas.toDataURL('image/png');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(luminaPressTheme);

  const setTheme = (themeKey: string) => {
    const newTheme = themes[themeKey];
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  const downloadAppIcon = useCallback(() => {
    // Generate a high-resolution (1024x1024) icon for download using the Path method
    const size = 1024;
    const pngUrl = generateIconFromPath(currentTheme.iconPath, size, currentTheme.colors.primary['500'], '#FFFFFF');
    
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `${currentTheme.appName.replace(/\s+/g, '-').toLowerCase()}-icon.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentTheme]);

  useEffect(() => {
    // 1. Update Document Title
    document.title = currentTheme.appName;

    const updateIconsAndManifest = () => {
        const themeColor = currentTheme.colors.primary['500'];
        const whiteIconColor = '#FFFFFF';

        // 2. Update Browser Tab Favicon
        // (Directly use SVG for tab icon as it scales perfectly there)
        let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!iconLink) {
             iconLink = document.createElement('link');
             iconLink.rel = 'icon';
             document.head.appendChild(iconLink);
        }
        iconLink.href = currentTheme.favicon;

        // 3. Update iOS Home Screen Icon
        // Use the Path method to reliably generate the PNG
        const appleIconPng = generateIconFromPath(currentTheme.iconPath, 180, themeColor, whiteIconColor);
        
        let appleLink = document.getElementById('dynamic-apple-icon') as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.id = 'dynamic-apple-icon';
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = appleIconPng;

        // 4. Update Theme Color Meta
        let metaThemeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;

        // 5. Generate & Update Web App Manifest
        // Use the Path method for 192 and 512 icons
        const icon192 = generateIconFromPath(currentTheme.iconPath, 192, themeColor, whiteIconColor);
        const icon512 = generateIconFromPath(currentTheme.iconPath, 512, themeColor, whiteIconColor);

        const manifest = {
            name: currentTheme.appName,
            short_name: currentTheme.appName,
            start_url: ".",
            display: "standalone",
            background_color: themeColor,
            theme_color: themeColor,
            description: `Reading experience for ${currentTheme.appName}`,
            icons: [
                { 
                    src: icon192, 
                    sizes: "192x192", 
                    type: "image/png",
                    purpose: "any maskable"
                },
                { 
                    src: icon512, 
                    sizes: "512x512", 
                    type: "image/png",
                    purpose: "any maskable"
                }
            ]
        };

        const stringManifest = JSON.stringify(manifest);
        const blob = new Blob([stringManifest], {type: 'application/json'});
        const manifestURL = URL.createObjectURL(blob);
        
        let manifestLink = document.getElementById('dynamic-manifest') as HTMLLinkElement;
        if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.id = 'dynamic-manifest';
            manifestLink.rel = 'manifest';
            document.head.appendChild(manifestLink);
        }
        
        // Clean up previous blob
        if (manifestLink.href && manifestLink.href.startsWith('blob:')) {
            URL.revokeObjectURL(manifestLink.href);
        }
        manifestLink.href = manifestURL;
    };

    updateIconsAndManifest();

  }, [currentTheme]);

  const value = useMemo(() => ({ theme: currentTheme, setTheme, downloadAppIcon }), [currentTheme, setTheme, downloadAppIcon]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
