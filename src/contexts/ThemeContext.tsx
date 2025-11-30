
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
   * Using standard 24x24 grid paths for stability.
   */
  const generateIconSvgString = useCallback((theme: Theme): string => {
    // Check if the path is a short 24x24 path (standard icon) vs a complex 512 path.
    // 24x24 paths are typically short (< 1000 chars)
    const isStandardIconPath = theme.iconPath.length < 1000;
    
    let viewBox = "0 0 512 512";
    let rectSize = 512;
    let rectX = 0;
    let rectY = 0;
    let path = theme.iconPath;
    
    // For standard 24x24 icons (like BookWise), we use sophisticated padding.
    // A 24x24 icon centered in a 32x32 viewbox gives elegant margins and prevents the "fat" look.
    if (isStandardIconPath) {
        viewBox = "-4 -4 32 32"; 
        rectSize = 32;
        rectX = -4;
        rectY = -4;
    }

    const bgColor = theme.colors.primary['500'];
    const iconColor = "#FFFFFF";

    // We draw a rect covering the viewBox (with rounded corners) and then the path on top.
    // fill-rule="evenodd" is critical for refined icons to punch out "holes" (like lines on a page) correctly.
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
