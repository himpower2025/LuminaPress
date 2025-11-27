
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  downloadAppIcon: () => void;
  openIconInNewTab: () => void;
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

  /**
   * Generates a robust SVG Blob URL.
   * Uses standard SVG transforms to center the 512x512 icon within a 1024x1024 container.
   */
  const generateIconBlobUrl = useCallback((theme: Theme): string => {
    // 1. Define Standard Dimensions
    const canvasSize = 1024;
    const iconOriginalSize = 512;
    const iconScale = 1.0; // Scale relative to original 512px (making it 512px visual size)
    
    // 2. Calculate Center Position
    // We want the 512x512 icon to be centered in 1024x1024.
    // Center of canvas = 512, 512.
    // Center of icon = 256, 256.
    // Translate = (CanvasCenter) - (IconCenter * Scale)
    // Actually simpler with SVG Group transform:
    // Move to center of canvas (512,512), scale, then move back by half icon size (-256, -256).
    
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
        <rect width="100%" height="100%" fill="${theme.colors.primary['500']}"/>
        <g transform="translate(512, 512) scale(${iconScale}) translate(-256, -256)">
          <path d="${theme.iconPath}" fill="#FFFFFF"/>
        </g>
      </svg>
    `.trim();

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, []);

  const generatePngFromSvg = useCallback((theme: Theme, callback: (url: string) => void) => {
    const svgUrl = generateIconBlobUrl(theme);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
           const pngUrl = canvas.toDataURL('image/png');
           callback(pngUrl);
        } catch (e) {
           console.error("Canvas to Data URL failed", e);
           // Fallback to SVG if PNG fails
           callback(svgUrl);
        }
      }
      URL.revokeObjectURL(svgUrl);
    };

    img.onerror = () => {
        console.error("Failed to load SVG for conversion");
        callback(svgUrl); // Fallback
    };

    img.src = svgUrl;
  }, [generateIconBlobUrl]);


  const downloadAppIcon = useCallback(() => {
    generatePngFromSvg(currentTheme, (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentTheme.appName.replace(/\s+/g, '-').toLowerCase()}-icon.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  }, [currentTheme, generatePngFromSvg]);

  const openIconInNewTab = useCallback(() => {
      generatePngFromSvg(currentTheme, (url) => {
          const win = window.open();
          if (win) {
              win.document.write(`<img src="${url}" style="width:100%; height:auto; max-width: 512px; border: 1px solid #ccc;" />`);
              win.document.title = "App Icon Preview";
              win.document.body.style.margin = "0";
              win.document.body.style.display = "flex";
              win.document.body.style.justifyContent = "center";
              win.document.body.style.alignItems = "center";
              win.document.body.style.height = "100vh";
              win.document.body.style.backgroundColor = "#f0f0f0";
          }
      });
  }, [currentTheme, generatePngFromSvg]);


  useEffect(() => {
    // 1. Update Document Title
    document.title = currentTheme.appName;

    // 2. Generate Assets
    const themeColor = currentTheme.colors.primary['500'];
    const svgUrl = generateIconBlobUrl(currentTheme);

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

        // Helper to generate data URL
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
        
        // Clean up previous blob
        if (manifestLink.href && manifestLink.href.startsWith('blob:')) {
            URL.revokeObjectURL(manifestLink.href);
        }
        manifestLink.href = manifestURL;
    };

    // Cleanup main SVG blob when theme changes
    return () => {
        URL.revokeObjectURL(svgUrl);
    };

  }, [currentTheme, generateIconBlobUrl]);

  const value = useMemo(() => ({ theme: currentTheme, setTheme, downloadAppIcon, openIconInNewTab }), [currentTheme, setTheme, downloadAppIcon, openIconInNewTab]);

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
