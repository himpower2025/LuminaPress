
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  downloadAppIcon: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to convert SVG Data URI to PNG Data URI using Canvas
// Uses canvas compositing to force the icon color to white (or specified color)
// ensuring visibility against the background regardless of original SVG attributes.
const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string, iconColor: string = '#FFFFFF'): Promise<string> => {
  return new Promise((resolve) => {
    try {
      // 1. Decode the SVG String to inspect/modify it
      let svgStr = "";
      const commaIdx = svgDataUri.indexOf(',');
      const content = commaIdx > -1 ? svgDataUri.substring(commaIdx + 1) : svgDataUri;
      
      // Robust decoding for Base64 or URL-encoded SVG
      if (svgDataUri.includes(";base64,") || /^[A-Za-z0-9+/=]+$/.test(content.replace(/\s/g, ''))) {
         try {
            svgStr = atob(content);
         } catch (e) {
            svgStr = decodeURIComponent(content);
         }
      } else {
         svgStr = decodeURIComponent(content);
      }

      // 2. Parse Aspect Ratio from viewBox (supports spaces and commas)
      // Example: "0 0 512 512" or "0,0,512,512"
      let aspectRatio = 1;
      const viewBoxMatch = svgStr.match(/viewBox=["']\s*([\d\.]+)[,\s]+([\d\.]+)[,\s]+([\d\.]+)[,\s]+([\d\.]+)\s*["']/i);
      if (viewBoxMatch) {
        const w = parseFloat(viewBoxMatch[3]);
        const h = parseFloat(viewBoxMatch[4]);
        if (w > 0 && h > 0) {
          aspectRatio = w / h;
        }
      }

      // 3. Inject explicit width/height into SVG to force high-res rasterization.
      // We replace existing dimensions with the target size to prevent blurry upscaling.
      const svgOpenTagMatch = svgStr.match(/<svg[^>]*>/i);
      let finalSvgDataUri = svgDataUri;
      
      if (svgOpenTagMatch) {
          const originalTag = svgOpenTagMatch[0];
          let newTag = originalTag
             .replace(/\s+(width|height)\s*=\s*["'][^"']*["']/gi, '') // Remove existing dims
             .replace(/>$/, ''); // Open the tag
          
          // Inject target size (e.g., width="1024" height="1024")
          newTag += ` width="${size}" height="${size}">`;
          
          const newSvgStr = svgStr.replace(originalTag, newTag);
          
          // Re-encode to ensure the Image object loads the modified version
          finalSvgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(newSvgStr)}`;
      }

      // 4. Load Image
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

        // A. Draw Background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // B. Calculate Icon Placement (Center, Contain, with Padding)
        const padding = size * 0.25; // 25% padding total
        const drawArea = size - padding;
        
        let dw = drawArea;
        let dh = drawArea / aspectRatio;

        // Adjust dimensions to fit within drawArea while maintaining aspect ratio
        if (dh > drawArea) {
            dh = drawArea;
            dw = drawArea * aspectRatio;
        }
        
        const dx = (size - dw) / 2;
        const dy = (size - dh) / 2;

        // C. Draw Icon with "Source-In" Composite to force Color
        // This technique uses the alpha channel of the loaded SVG to mask a solid color fill.
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = size;
        maskCanvas.height = size;
        const maskCtx = maskCanvas.getContext('2d');
        
        if (maskCtx) {
            // 1. Draw the SVG image (could be any color, black, orange, etc.)
            maskCtx.drawImage(img, dx, dy, dw, dh);
            
            // 2. Change composition mode: New drawing only appears where existing pixels are opaque.
            maskCtx.globalCompositeOperation = 'source-in';
            
            // 3. Fill with the desired icon color (White). 
            // This effectively "paints" the SVG shape with white.
            maskCtx.fillStyle = iconColor;
            maskCtx.fillRect(0, 0, size, size);
            
            // 4. Draw the result onto the main canvas
            ctx.drawImage(maskCanvas, 0, 0);
        } else {
            // Fallback: draw directly without color masking if offscreen canvas fails
            ctx.drawImage(img, dx, dy, dw, dh);
        }

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = (err) => {
        console.warn("SVG Load Error", err);
        // Fallback: return original if image loading fails
        resolve(svgDataUri);
      };

      img.src = finalSvgDataUri;

    } catch (e) {
      console.error("Icon Generation Error", e);
      resolve(svgDataUri);
    }
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
    // Force icon to be WHITE to contrast with the primary background color
    const size = 1024;
    const pngUrl = await generatePngIcon(currentTheme.favicon, size, currentTheme.colors.primary['500'], '#FFFFFF');
    
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

        // 3. Update iOS Home Screen Icon (PNG with Background, White Icon)
        // 180px is standard for iPhone
        const appleIconPng = await generatePngIcon(currentTheme.favicon, 180, themeColor, whiteIconColor);
        
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
        // Chrome Android mostly uses 192 and 512. Use White Icon on Colored BG.
        const icon192 = await generatePngIcon(currentTheme.favicon, 192, themeColor, whiteIconColor);
        const icon512 = await generatePngIcon(currentTheme.favicon, 512, themeColor, whiteIconColor);

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
