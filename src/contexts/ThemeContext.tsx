
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  downloadAppIcon: () => void;
  iconUrl: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(luminaPressTheme);
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  const setTheme = (themeKey: string) => {
    const newTheme = themes[themeKey];
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  /**
   * Generates a clean, standard SVG string.
   * Optimized for standard icon paths (now 24x24 basis for cleaner lines).
   */
  const generateIconSvgString = useCallback((theme: Theme): string => {
    // 24x24 basis (Material Design standard) provides cleaner, less "fat" strokes.
    // Padding: -4 offset with 32 width creates a comfortable margin around the 24px icon.
    // 24 icon + 4 padding each side = 32 total viewbox dimension.
    const viewBox = "-4 -4 32 32";
    
    // The background rect covers this entire padded area.
    const rectX = -4;
    const rectY = -4;
    const rectSize = 32;
    
    const path = theme.iconPath;
    const bgColor = theme.colors.primary['500'];
    const iconColor = "#FFFFFF";

    // Rounded corners: approx 22% of size is standard for iOS/Android adaptive icons.
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${viewBox}">
        <rect x="${rectX}" y="${rectY}" width="${rectSize}" height="${rectSize}" fill="${bgColor}" rx="${rectSize * 0.22}" ry="${rectSize * 0.22}"/>
        <path d="${path}" fill="${iconColor}" fill-rule="evenodd" />
      </svg>
    `.trim();
  }, []);

  const generateIconBlobUrl = useCallback((theme: Theme): string => {
    const svgString = generateIconSvgString(theme);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, [generateIconSvgString]);

  const downloadAppIcon = useCallback(() => {
    if (iconUrl) {
        const link = document.createElement('a');
        link.href = iconUrl;
        link.download = `${currentTheme.appName.replace(/\s+/g, '-').toLowerCase()}-icon.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }, [iconUrl, currentTheme]);

  useEffect(() => {
    // 1. Update Document Title
    document.title = currentTheme.appName;

    // 2. Generate Assets
    const themeColor = currentTheme.colors.primary['500'];
    const svgUrl = generateIconBlobUrl(currentTheme);
    setIconUrl(svgUrl);

    // 3. Update Browser Tab Favicon
    let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!iconLink) {
            iconLink = document.createElement('link');
            iconLink.rel = 'icon';
            document.head.appendChild(iconLink);
    }
    iconLink.href = svgUrl;
    iconLink.type = 'image/svg+xml';

    // 4. Update Theme Color Meta
    let metaThemeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = themeColor;

    // 5. Generate PNGs for Apple/Manifest (Async)
    const img = new Image();
    img.src = svgUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const generateIcon = (size: number) => {
            canvas.width = size;
            canvas.height = size;
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            return canvas.toDataURL('image/png');
        };

        const icon192 = generateIcon(192);
        const icon512 = generateIcon(512);
        const appleIcon = generateIcon(180);

        // Update Apple Touch Icon
        let appleLink = document.getElementById('dynamic-apple-icon') as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.id = 'dynamic-apple-icon';
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = appleIcon;

        // Update Web App Manifest
        const manifest = {
            name: currentTheme.appName,
            short_name: currentTheme.appName,
            start_url: ".",
            display: "standalone",
            background_color: themeColor,
            theme_color: themeColor,
            description: `Reading experience for ${currentTheme.appName}`,
            icons: [
                { src: icon192, sizes: "192x192", type: "image/png", purpose: "any maskable" },
                { src: icon512, sizes: "512x512", type: "image/png", purpose: "any maskable" }
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
        
        if (manifestLink.href && manifestLink.href.startsWith('blob:')) {
            URL.revokeObjectURL(manifestLink.href);
        }
        manifestLink.href = manifestURL;
    };

    return () => {
        URL.revokeObjectURL(svgUrl);
    };

  }, [currentTheme, generateIconBlobUrl]);

  const value = useMemo(() => ({ theme: currentTheme, setTheme, downloadAppIcon, iconUrl }), [currentTheme, setTheme, downloadAppIcon, iconUrl]);

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
