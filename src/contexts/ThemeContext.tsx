
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(luminaPressTheme);

  const setTheme = (themeKey: string) => {
    const newTheme = themes[themeKey];
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  useEffect(() => {
    // 1. Update Document Title
    document.title = currentTheme.appName;

    // 2. Helper function to convert SVG Data URI to PNG Data URI using Canvas
    // Improved to create a proper "App Icon" look: Theme Color Background + White Logo + Padding
    const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string): Promise<string> => {
      return new Promise((resolve) => {
        // Attempt to create a white version of the logo for better contrast against the colored background.
        // Replaces the specific hex color encoded in the SVG string with white (#ffffff).
        const whiteSvgUri = svgDataUri.replace(/fill='%23[a-fA-F0-9]{6}'/g, "fill='%23ffffff'");

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             // A. Draw Background (Theme Color)
             ctx.fillStyle = backgroundColor;
             ctx.fillRect(0, 0, size, size);

             // B. Draw Icon with Padding
             // Use 20% padding on each side to ensure logo is centered and safe from rounded corners
             const padding = size * 0.20; 
             const iconSize = size - (padding * 2);
             
             // C. High Quality Settings
             ctx.imageSmoothingEnabled = true;
             ctx.imageSmoothingQuality = 'high';
             
             // Draw the white logo centered
             ctx.drawImage(img, padding, padding, iconSize, iconSize);
             
             resolve(canvas.toDataURL('image/png'));
          } else {
             // Fallback if canvas context fails
             resolve(svgDataUri);
          }
        };
        // If image fails to load (e.g., bad URI), resolve with original
        img.onerror = () => resolve(svgDataUri);
        img.src = whiteSvgUri;
      });
    };

    const updateIconsAndManifest = async () => {
        const themeColor = currentTheme.colors.primary['500'];

        // --- A. Update Browser Tab Favicon (Original Colored SVG) ---
        let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!iconLink) {
             iconLink = document.createElement('link');
             iconLink.rel = 'icon';
             document.head.appendChild(iconLink);
        }
        // Keep browser tab icon as the original colored SVG (no background)
        iconLink.href = currentTheme.favicon;

        // --- B. Update iOS Home Screen Icon (PNG with Background) ---
        // 180x180 is standard for iPhone
        const appleIconPng = await generatePngIcon(currentTheme.favicon, 180, themeColor);
        let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = appleIconPng;

        // --- C. Update Android/Chrome Meta Theme Color ---
        let metaThemeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;

        // --- D. Generate & Update Web App Manifest (JSON) ---
        // We generate icon sizes for Android: 192x192 and 512x512
        const icon192 = await generatePngIcon(currentTheme.favicon, 192, themeColor);
        const icon512 = await generatePngIcon(currentTheme.favicon, 512, themeColor);

        const manifest = {
            name: currentTheme.appName,
            short_name: currentTheme.appName,
            start_url: ".",
            display: "standalone",
            background_color: themeColor, // Splash screen background matches theme
            theme_color: themeColor,
            description: `Reading experience for ${currentTheme.appName}`,
            icons: [
                { 
                    src: icon192, 
                    sizes: "192x192", 
                    type: "image/png",
                    purpose: "any maskable" // 'maskable' ensures it fills the circle/squircle on Android
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
        
        let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
        if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            document.head.appendChild(manifestLink);
        }
        // Revoke old URL to avoid memory leaks if frequent changes occur (optional optimization)
        if (manifestLink.href && manifestLink.href.startsWith('blob:')) {
            URL.revokeObjectURL(manifestLink.href);
        }
        manifestLink.href = manifestURL;
    };

    updateIconsAndManifest();

  }, [currentTheme]);

  const value = useMemo(() => ({ theme: currentTheme, setTheme }), [currentTheme]);

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
