
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
    // Generates a high-quality, centered, white icon on a theme-colored background
    const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string): Promise<string> => {
      return new Promise((resolve) => {
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

            // A. Draw Background (Theme Color)
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, size, size);

            // B. Determine Dimensions & Aspect Ratio (Robust)
            // Priority 1: Use natural dimensions from the browser-loaded image
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;

            // Priority 2: If browser reports 0 (common with some SVGs missing explicit width/height), 
            // parse the viewBox from the raw XML.
            if (!w || !h || w === 0 || h === 0) {
                try {
                  // CRITICAL FIX: Decode the URI to handle %20, %3C, etc. before regex
                  const decodedUri = decodeURIComponent(svgDataUri);
                  const viewBoxMatch = decodedUri.match(/viewBox=['"]\s*[\d\.\-]+\s+[\d\.\-]+\s+([\d\.]+)\s+([\d\.]+)\s*['"]/i);
                  if (viewBoxMatch && viewBoxMatch.length >= 3) {
                      w = parseFloat(viewBoxMatch[1]);
                      h = parseFloat(viewBoxMatch[2]);
                  } else {
                      // Fallback default if parsing fails completely
                      w = 512; 
                      h = 512; 
                  }
                } catch (e) {
                  console.warn("Failed to parse SVG dimensions", e);
                  w = 512; h = 512;
                }
            }

            // Calculate Aspect Ratio
            const aspectRatio = (h > 0) ? w / h : 1;

            // C. Calculate Draw Size (Fit within 60% of container)
            // This provides a safe margin (padding) so the logo isn't cut off by rounded corners (squircle).
            const targetSize = size * 0.6; 
            
            let drawW = targetSize;
            let drawH = drawW / aspectRatio;

            // If the calculated height exceeds the target box (for tall icons), constrain by height instead
            if (drawH > targetSize) {
                drawH = targetSize;
                drawW = drawH * aspectRatio;
            }

            // D. Center Coordinates (Perfect Symmetry)
            const x = (size - drawW) / 2;
            const y = (size - drawH) / 2;

            // E. High Quality Rendering Settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // F. Draw White Icon with Shadow (using Composite Masking)
            // Create a temporary canvas to serve as the mask source
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = size;
            maskCanvas.height = size;
            const maskCtx = maskCanvas.getContext('2d');
            
            if (maskCtx) {
                maskCtx.imageSmoothingEnabled = true;
                maskCtx.imageSmoothingQuality = 'high';
                
                // Draw image on mask canvas at the calculated centered position
                maskCtx.drawImage(img, x, y, drawW, drawH);
                
                // Change composite mode to 'source-in' -> keeps the shape of the image but replaces the color
                maskCtx.globalCompositeOperation = 'source-in';
                
                // Fill with pure white
                maskCtx.fillStyle = '#ffffff';
                maskCtx.fillRect(0, 0, size, size);

                // Draw shadow on main canvas for depth
                ctx.save();
                ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                ctx.shadowBlur = size * 0.04;
                ctx.shadowOffsetY = size * 0.02;
                
                // Draw the white-masked icon onto main canvas
                ctx.drawImage(maskCanvas, 0, 0);
                ctx.restore();
            } else {
                // Fallback: just draw the original image if mask context fails
                ctx.drawImage(img, x, y, drawW, drawH);
            }
            
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            console.warn("Failed to load SVG for icon generation");
            resolve(svgDataUri);
        };

        img.src = svgDataUri;
      });
    };

    const updateIconsAndManifest = async () => {
        const themeColor = currentTheme.colors.primary['500'];

        // --- A. Update Browser Tab Favicon ---
        // We use the original SVG for the tab as it supports transparency well
        let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!iconLink) {
             iconLink = document.createElement('link');
             iconLink.rel = 'icon';
             document.head.appendChild(iconLink);
        }
        iconLink.href = currentTheme.favicon;

        // --- B. Update iOS Home Screen Icon (PNG with Background) ---
        const appleIconPng = await generatePngIcon(currentTheme.favicon, 180, themeColor);
        
        let appleLink = document.getElementById('dynamic-apple-icon') as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.id = 'dynamic-apple-icon';
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = appleIconPng;

        // --- C. Update Theme Color Meta ---
        let metaThemeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;

        // --- D. Generate & Update Web App Manifest (JSON) ---
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
        
        // Clean up previous blob to avoid memory leaks
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
