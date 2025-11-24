
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { themes, Theme, luminaPressTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  downloadAppIcon: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to convert SVG Data URI to PNG Data URI using Canvas
// Now accepts an iconColor to ensure contrast against the background.
const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string, iconColor: string = '#FFFFFF'): Promise<string> => {
  return new Promise((resolve) => {
    try {
      // 1. Decode the SVG Data URI
      const commaIdx = svgDataUri.indexOf(',');
      let content = svgDataUri;
      if (commaIdx > -1) {
         content = svgDataUri.substring(commaIdx + 1);
      }
      
      let svgStr = "";
      if (svgDataUri.includes(";base64,")) {
         svgStr = atob(content);
      } else {
         svgStr = decodeURIComponent(content);
      }

      // 2. Parse ViewBox to determine the TRUE intrinsic aspect ratio
      // Regex looks for viewBox="0 0 W H" or viewBox='0 0 W H'
      const viewBoxRegex = /viewBox=["']\s*[\d\.]+\s+[\d\.]+\s+([\d\.]+)\s+([\d\.]+)\s*["']/i;
      const match = svgStr.match(viewBoxRegex);

      let aspectRatio = 1;
      if (match) {
        const vbW = parseFloat(match[1]);
        const vbH = parseFloat(match[2]);
        if (vbW > 0 && vbH > 0) {
          aspectRatio = vbW / vbH;
        }
      }

      // 3. Calculate optimal dimensions within the canvas (Contain strategy)
      // Use 25% total padding (12.5% per side) for a nice safe area
      const padding = size * 0.25; 
      const drawSize = size - padding;

      let renderW = drawSize;
      let renderH = drawSize;

      if (aspectRatio >= 1) {
        // Wider or Square
        renderW = drawSize;
        renderH = drawSize / aspectRatio;
      } else {
        // Taller
        renderH = drawSize;
        renderW = drawSize * aspectRatio;
      }

      // Ensure integer dimensions for crisp rendering
      renderW = Math.floor(renderW);
      renderH = Math.floor(renderH);

      // 4. Modify the SVG string to ENFORCE dimensions and COLOR
      
      // Find the opening <svg ...> tag
      const svgOpenTagMatch = svgStr.match(/<svg[^>]*>/i);
      
      let fixedSvg = svgStr;

      if (svgOpenTagMatch) {
          const originalOpenTag = svgOpenTagMatch[0];
          
          // Remove existing attributes that conflict or define color/size
          let newOpenTag = originalOpenTag
            .replace(/\s+(width|height|fill|style)\s*=\s*["'][^"']*["']/gi, '');

          // Remove the closing bracket to append new attributes
          newOpenTag = newOpenTag.replace(/>$/, '');

          // Append forced attributes: 
          // 1. Dimensions for high-res rasterization
          // 2. Fill color (white) for visibility
          newOpenTag += ` width="${renderW}" height="${renderH}" fill="${iconColor}" style="fill:${iconColor}">`;
          
          // Replace the tag in the string
          fixedSvg = svgStr.replace(originalOpenTag, newOpenTag);
      }

      // 5. Create a new Image source
      const newSvgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fixedSvg)}`;

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

        // Draw Background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Center the image on the canvas
        const x = (size - renderW) / 2;
        const y = (size - renderH) / 2;

        // Draw with high quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, renderW, renderH);

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = (e) => {
        console.warn("SVG Load Error", e);
        resolve(svgDataUri);
      };

      img.src = newSvgDataUri;

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
