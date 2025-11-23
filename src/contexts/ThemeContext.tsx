
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
    // Uses DOMParser for robust SVG handling and Canvas Compositing for perfect coloring.
    const generatePngIcon = (svgDataUri: string, size: number, backgroundColor: string): Promise<string> => {
      return new Promise((resolve) => {
        try {
            // 1. Decode SVG Content
            const isBase64 = svgDataUri.includes("base64,");
            const dataContent = isBase64 ? svgDataUri.split("base64,")[1] : svgDataUri.split(",")[1];
            // Decode URI component regardless, handle base64 manually
            const svgString = isBase64 ? atob(dataContent) : decodeURIComponent(dataContent);

            // 2. Parse SVG to DOM to correctly get dimensions
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgString, "image/svg+xml");
            const svgElement = doc.documentElement;
            
            if (svgElement.nodeName !== 'svg') {
                console.warn("Parsed content is not an SVG");
                resolve(svgDataUri);
                return;
            }

            // 3. Determine native Dimensions from viewBox or width/height attributes
            // Default to 512 if nothing is found
            let width = 512;
            let height = 512;
            
            if (svgElement.hasAttribute("viewBox")) {
                const vb = svgElement.getAttribute("viewBox")!.split(/[\s,]+/).filter(Boolean);
                if (vb.length === 4) {
                    width = parseFloat(vb[2]);
                    height = parseFloat(vb[3]);
                }
            } else {
                 const w = svgElement.getAttribute("width");
                 const h = svgElement.getAttribute("height");
                 if (w) width = parseFloat(w);
                 if (h) height = parseFloat(h);
            }

            // 4. Inject explicit width/height to ensure browser rasterizes at high resolution
            // We set the SVG's intrinsic size to match its coordinate system (viewBox)
            // This prevents the browser from defaulting to small sizes (like 300x150) which causes blur.
            svgElement.setAttribute("width", width.toString());
            svgElement.setAttribute("height", height.toString());

            // 5. Serialize back to Data URI
            const serializer = new XMLSerializer();
            const newSvgString = serializer.serializeToString(svgElement);
            // Always use base64 for the Image src to avoid encoding issues with complex SVGs
            const base64Svg = btoa(newSvgString);
            const finalSrc = `data:image/svg+xml;base64,${base64Svg}`;

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

                // B. Calculate Sizing (60% of container is a good aesthetic standard)
                const iconRatio = 0.60; 
                const maxDimension = size * iconRatio;
                
                let drawW, drawH;
                const aspectRatio = width / height;

                if (aspectRatio >= 1) {
                    // Wider than tall
                    drawW = maxDimension;
                    drawH = maxDimension / aspectRatio;
                } else {
                    // Taller than wide
                    drawH = maxDimension;
                    drawW = maxDimension * aspectRatio;
                }

                // Center coordinates
                const x = (size - drawW) / 2;
                const y = (size - drawH) / 2;

                // C. Draw White Icon with Shadow (using Masking/Compositing)
                // We create a temporary canvas to draw the SVG, then fill it with white (source-in)
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = size;
                maskCanvas.height = size;
                const maskCtx = maskCanvas.getContext('2d');

                if (maskCtx) {
                    // 1. Draw the image (shape)
                    maskCtx.drawImage(img, x, y, drawW, drawH);
                    
                    // 2. Change composite mode to only keep pixels where the image is
                    maskCtx.globalCompositeOperation = 'source-in';
                    
                    // 3. Fill with white -> effectively tints the shape white
                    maskCtx.fillStyle = '#ffffff';
                    maskCtx.fillRect(0, 0, size, size);

                    // 4. Draw shadow on main canvas
                    ctx.save();
                    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                    ctx.shadowBlur = size * 0.05;
                    ctx.shadowOffsetY = size * 0.02;
                    
                    // 5. Draw the white icon onto the main canvas
                    ctx.drawImage(maskCanvas, 0, 0);
                    ctx.restore();
                } else {
                    // Fallback if offscreen canvas fails
                    ctx.drawImage(img, x, y, drawW, drawH);
                }

                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = (e) => {
                console.error("Icon generation image load failed:", e);
                resolve(svgDataUri); // Fallback to original
            };

            img.src = finalSrc;

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
