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
    // Uses Canvas Compositing for perfect coloring and ViewBox parsing for perfect proportions.
    const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string): Promise<string> => {
      return new Promise((resolve) => {
        try {
            // Helper to get aspect ratio from SVG string directly (safest for SVGs without width/height)
            const getSvgAspectRatio = (uri: string): number => {
                try {
                    const decoded = decodeURIComponent(uri);
                    const viewBoxMatch = decoded.match(/viewBox=['"]\s*([\d\.-]+)\s+([\d\.-]+)\s+([\d\.-]+)\s+([\d\.-]+)\s*['"]/);
                    if (viewBoxMatch && viewBoxMatch.length >= 5) {
                        const w = parseFloat(viewBoxMatch[3]);
                        const h = parseFloat(viewBoxMatch[4]);
                        if (w > 0 && h > 0) return w / h;
                    }
                } catch (e) {
                    console.warn("Failed to parse viewBox", e);
                }
                return 1; // Default to square if parsing fails
            };

            const aspectRatio = getSvgAspectRatio(svgDataUri);

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = svgDataUri;

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

                // B. Calculate Sizing & Positioning
                // Use 60% of the container for the icon to ensure good visibility and padding
                const targetMaxDimension = size * 0.60;
                
                let renderWidth, renderHeight;

                if (aspectRatio > 1) {
                    // Wider than tall
                    renderWidth = targetMaxDimension;
                    renderHeight = targetMaxDimension / aspectRatio;
                } else {
                    // Taller than wide or square
                    renderHeight = targetMaxDimension;
                    renderWidth = targetMaxDimension * aspectRatio;
                }

                // Math.floor ensures integer coordinates for sharp rendering
                const x = Math.floor((size - renderWidth) / 2);
                const y = Math.floor((size - renderHeight) / 2);

                // C. Create Offscreen Canvas for White Tinting
                // This method guarantees the icon becomes pure white regardless of its original colors
                const offCanvas = document.createElement('canvas');
                offCanvas.width = size;
                offCanvas.height = size;
                const offCtx = offCanvas.getContext('2d');

                if (offCtx) {
                    // 1. Draw the image centered
                    offCtx.drawImage(img, x, y, renderWidth, renderHeight);
                    
                    // 2. Composite Mode 'source-in' keeps the shape but replaces the color
                    offCtx.globalCompositeOperation = 'source-in';
                    offCtx.fillStyle = '#ffffff';
                    offCtx.fillRect(0, 0, size, size);

                    // D. Draw Shadow & Final Icon on Main Canvas
                    ctx.save();
                    // Soft, subtle shadow for depth
                    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                    ctx.shadowBlur = size * 0.05;
                    ctx.shadowOffsetY = size * 0.02;
                    ctx.shadowOffsetX = 0;
                    
                    // Draw the white-tinted icon
                    ctx.drawImage(offCanvas, 0, 0);
                    ctx.restore();
                } else {
                    // Fallback
                    ctx.drawImage(img, x, y, renderWidth, renderHeight);
                }

                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = (e) => {
                console.warn("Error loading SVG for icon generation:", e);
                resolve(svgDataUri);
            };

        } catch (e) {
            console.error("Error generating PNG icon:", e);
            resolve(svgDataUri);
        }
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
        // Keep browser tab icon as the original colored SVG (transparent background)
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
        // Revoke old URL to avoid memory leaks if frequent changes occur
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