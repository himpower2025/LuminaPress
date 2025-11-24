
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  downloadAppIcon: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to convert SVG Data URI to PNG Data URI using Canvas
const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string): Promise<string> => {
  return new Promise((resolve) => {
    // 1. Parse the SVG string from the Data URI
    let svgString = '';
    try {
      if (svgDataUri.startsWith('data:image/svg+xml;base64,')) {
        svgString = atob(svgDataUri.split(',')[1]);
      } else if (svgDataUri.startsWith('data:image/svg+xml,')) {
        svgString = decodeURIComponent(svgDataUri.split(',')[1]);
      } else {
        // Try decoding if it looks encoded, otherwise use raw
        try {
             svgString = decodeURIComponent(svgDataUri);
        } catch {
             svgString = svgDataUri;
        }
      }
    } catch (e) {
      console.error("Error decoding SVG Data URI", e);
      resolve(svgDataUri);
      return;
    }

    // 2. Manipulate SVG with DOMParser to enforce dimensions
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.documentElement;
    
    if (!svgElement || svgElement.tagName.toLowerCase() !== 'svg') {
        console.warn("Not a valid SVG");
        resolve(svgDataUri);
        return;
    }

    // Ensure viewBox exists for proper scaling
    if (!svgElement.hasAttribute('viewBox')) {
       const w = svgElement.getAttribute('width') || '512';
       const h = svgElement.getAttribute('height') || '512';
       svgElement.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
    }

    // Determine icon size (60% of the final image size)
    const iconSize = Math.floor(size * 0.6);
    
    // Force width and height attributes on the SVG. 
    // This guarantees the browser renders it at this exact square size, preserving aspect ratio via viewBox.
    svgElement.setAttribute('width', iconSize.toString());
    svgElement.setAttribute('height', iconSize.toString());
    
    // Serialize back to a string and create a new clean Data URI
    const serializer = new XMLSerializer();
    const newSvgString = serializer.serializeToString(svgElement);
    // Use robust base64 encoding that handles Unicode
    const newSvgDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(newSvgString)));

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(svgDataUri);
            return;
        }

        // 3. Draw Background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // 4. Draw Icon Centered
        const offset = (size - iconSize) / 2;

        // Use an intermediate canvas to apply the white fill mask
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = size;
        maskCanvas.height = size;
        const maskCtx = maskCanvas.getContext('2d');
        
        if (maskCtx) {
            maskCtx.imageSmoothingEnabled = true;
            maskCtx.imageSmoothingQuality = 'high';
            
            // Draw the resized SVG onto the mask canvas
            maskCtx.drawImage(img, offset, offset, iconSize, iconSize);
            
            // Composite source-in to fill with white
            maskCtx.globalCompositeOperation = 'source-in';
            maskCtx.fillStyle = '#ffffff';
            maskCtx.fillRect(0, 0, size, size);

            // Draw shadow on main canvas
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
            ctx.shadowBlur = size * 0.05;
            ctx.shadowOffsetY = size * 0.02;
            
            // Draw the white icon onto the main canvas
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.restore();
        } else {
            // Fallback
            ctx.drawImage(img, offset, offset, iconSize, iconSize);
        }
        
        resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (e) => {
        console.warn("Failed to load manipulated SVG for icon generation", e);
        resolve(svgDataUri);
    };

    img.src = newSvgDataUri;
  });
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(luminaPressTheme);

  const setTheme = (themeKey: string) => {
    const newTheme = themes[themeKey];
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  const downloadAppIcon = useCallback(async () => {
    // Generate a high-resolution (1024x1024) icon for download
    const size = 1024;
    const pngUrl = await generatePngIcon(currentTheme.favicon, size, currentTheme.colors.primary['500']);
    
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

    const updateIconsAndManifest = async () => {
        const themeColor = currentTheme.colors.primary['500'];

        // 2. Update Browser Tab Favicon
        let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!iconLink) {
             iconLink = document.createElement('link');
             iconLink.rel = 'icon';
             document.head.appendChild(iconLink);
        }
        iconLink.href = currentTheme.favicon;

        // 3. Update iOS Home Screen Icon (PNG with Background)
        const appleIconPng = await generatePngIcon(currentTheme.favicon, 180, themeColor);
        
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
        const icon192 = await generatePngIcon(currentTheme.favicon, 192, themeColor);
        const icon512 = await generatePngIcon(currentTheme.favicon, 512, themeColor);

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
