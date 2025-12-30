# PWA Icons for Order Management System

This directory contains icons for the Progressive Web App (PWA) installation.

## Icon Sizes Required

The manifest.json requires the following icon sizes:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Quick Generation Methods

### Method 1: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if needed
# sudo apt-get install imagemagick (Ubuntu/Debian)
# brew install imagemagick (macOS)

# Generate all sizes from SVG
for size in 72 96 128 144 152 192 384 512; do
  convert icon-template.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

### Method 2: Online Tools
1. Upload `icon-template.svg` to:
   - https://realfavicongenerator.net/
   - https://favicon.io/
   - https://www.pwabuilder.com/imageGenerator

2. Download the generated PNG files

3. Rename files to match the manifest.json format:
   - icon-72x72.png
   - icon-96x96.png
   - etc.

### Method 3: Use Existing Logo
If you have an existing logo.png file:

```bash
# Copy your logo to this directory
# Then resize to all required sizes:
for size in 72 96 128 144 152 192 384 512; do
  convert logo.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

## Temporary Solution
Until you generate proper icons, you can use the logo.png from the admin directory:

```bash
cp ../logo.png icon-192x192.png
cp ../logo.png icon-512x512.png
# Copy for all other sizes
```

## Icon Design Guidelines

1. **Simple Design**: Icons should be recognizable at small sizes (72x72)
2. **High Contrast**: Use colors that stand out
3. **Centered**: Leave some padding around the edges
4. **No Text** (for small sizes): Text becomes unreadable below 128px
5. **Maskable**: Design should work when cropped to a circle (safe zone)

## Testing Your Icons

After generating icons, test them by:
1. Opening your PWA in Chrome
2. Going to DevTools > Application > Manifest
3. Checking if all icon sizes load correctly

## Colors Used

- Primary: #667eea (Purple-blue)
- Secondary: #764ba2 (Purple)
- Success: #4caf50 (Green)
- Background: White (#ffffff)
