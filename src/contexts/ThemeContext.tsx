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
        try {
            // Decode the URI component to handle the SVG string directly
            const rawSvgMatch = svgDataUri.match(/,(.+)/);
            if (!rawSvgMatch) {
                resolve(svgDataUri);
                return;
            }
            const svgContent = decodeURIComponent(rawSvgMatch[1]);

            // 1. Force White Color
            // Replace any fill color with white (#ffffff) to ensure high contrast
            let modifiedSvg = svgContent.replace(/fill=['"](%23|#)[a-fA-F0-9]{6}['"]/gi, 'fill="#ffffff"');
            
            // Handle cases where fill might be on a style attribute or missing
            if (!modifiedSvg.includes('fill=')) {
                modifiedSvg = modifiedSvg.replace('<svg', '<svg fill="#ffffff"');
            }

            // 2. Enforce High-Res Rasterization & Aesthetics
            // Use 50% of container size for ample whitespace (Apple/Google style)
            // Use Math.floor to prevent sub-pixel rendering (blurry edges)
            const iconSize = Math.floor(size * 0.50);
            const padding = Math.floor((size - iconSize) / 2);

            // Inject explicit width and height into the SVG tag. 
            // This is critical: without it, the browser might render the SVG at a small default size 
            // and then scale it up, causing blurriness. Setting it here ensures crisp vectors.
            if (modifiedSvg.includes('width=')) {
                modifiedSvg = modifiedSvg.replace(/width=['"][^'"]*['"]/, `width="${iconSize}"`);
            } else {
                modifiedSvg = modifiedSvg.replace('<svg', `<svg width="${iconSize}"`);
            }
            
            if (modifiedSvg.includes('height=')) {
                modifiedSvg = modifiedSvg.replace(/height=['"][^'"]*['"]/, `height="${iconSize}"`);
            } else {
                modifiedSvg = modifiedSvg.replace('<svg', `<svg height="${iconSize}"`);
            }

            // Re-encode into Data URI
            const whiteSvgUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(modifiedSvg);

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Draw Theme Color Background
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, size, size);

                    // Add Subtle Drop Shadow for Depth
                    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                    ctx.shadowBlur = size * 0.04; // Soft shadow proportional to size
                    ctx.shadowOffsetY = size * 0.02; // Slight downward offset
                    ctx.shadowOffsetX = 0;

                    // Draw Centered White Icon
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Draw at integer coordinates for sharpness
                    ctx.drawImage(img, padding, padding, iconSize, iconSize);
                    
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve(svgDataUri);
                }
            };
            img.onerror = (e) => {
                console.warn("Error loading SVG for icon generation:", e);
                resolve(svgDataUri);
            };
            img.src = whiteSvgUri;

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