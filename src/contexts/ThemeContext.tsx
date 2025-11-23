
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
            // 1. Extract and Decode SVG Content
            // Handle both base64 and URI encoded data URIs
            let svgContent = "";
            if (svgDataUri.includes("base64,")) {
                 svgContent = atob(svgDataUri.split("base64,")[1]);
            } else {
                 svgContent = decodeURIComponent(svgDataUri.split(",")[1]);
            }

            // 2. Parse ViewBox to determine Aspect Ratio
            // Default to square 512x512 if parsing fails
            let width = 512;
            let height = 512;
            const viewBoxMatch = svgContent.match(/viewBox=['"]\s*([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*['"]/);
            
            if (viewBoxMatch) {
                width = parseFloat(viewBoxMatch[3]);
                height = parseFloat(viewBoxMatch[4]);
            }
            
            // 3. Inject explicit width and height attributes
            // CRITICAL FIX: Browsers often default SVGs without dimensions to 300x150px.
            // This causes severe distortion when drawn to a square canvas. 
            // We strictly enforce dimensions matching the viewBox to preserve aspect ratio.
            if (!svgContent.includes("width=")) {
                svgContent = svgContent.replace("<svg", `<svg width="${width}" height="${height}"`);
            }
            
            // 4. Prepare Image Source (Base64 for reliable loading)
            const base64Svg = btoa(svgContent);
            const finalDataUri = `data:image/svg+xml;base64,${base64Svg}`;
            
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

                // B. Calculate Dimensions & Position
                // Use 50% of total size for the icon itself.
                // This provides ample padding (safe zone) for rounded icon masks (squircles).
                const paddingRatio = 0.5; 
                const maxIconSize = size * paddingRatio;
                
                const aspectRatio = width / height;
                let renderWidth, renderHeight;

                if (aspectRatio >= 1) {
                    // Wider than tall
                    renderWidth = maxIconSize;
                    renderHeight = maxIconSize / aspectRatio;
                } else {
                    // Taller than wide
                    renderHeight = maxIconSize;
                    renderWidth = maxIconSize * aspectRatio;
                }

                // Center the icon with integer coordinates for sharpness
                const x = (size - renderWidth) / 2;
                const y = (size - renderHeight) / 2;

                // C. Tinting Logic (Source-In Composite)
                const offCanvas = document.createElement('canvas');
                offCanvas.width = size;
                offCanvas.height = size;
                const offCtx = offCanvas.getContext('2d');
                
                if (offCtx) {
                    offCtx.drawImage(img, x, y, renderWidth, renderHeight);
                    
                    // Fill with white only where the image exists (Silhouetting)
                    offCtx.globalCompositeOperation = 'source-in';
                    offCtx.fillStyle = '#ffffff';
                    offCtx.fillRect(0, 0, size, size);
                    
                    // D. Add Shadow and Draw to Main Canvas
                    ctx.save();
                    // Subtle shadow for depth
                    ctx.shadowColor = "rgba(0, 0, 0, 0.2)"; 
                    ctx.shadowBlur = size * 0.04;
                    ctx.shadowOffsetY = size * 0.02;
                    
                    ctx.drawImage(offCanvas, 0, 0);
                    ctx.restore();
                } else {
                    // Fallback if offscreen canvas fails
                    ctx.drawImage(img, x, y, renderWidth, renderHeight);
                }

                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = () => {
                console.warn("Failed to load SVG for icon generation");
                resolve(svgDataUri);
            };

            img.src = finalDataUri;

        } catch (error) {
            console.error("Icon generation failed:", error);
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
