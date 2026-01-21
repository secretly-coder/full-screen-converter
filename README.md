# Full-Screen Browser PWA 🌐

A Progressive Web App that launches any website in true full-screen mode on mobile devices, eliminating browser chrome, navigation elements, and properly utilizing notch areas for an immersive experience.

## ✨ Features

- **True Full-Screen Mode** - Edge-to-edge rendering with no browser UI
- **Notch/Safe-Area Support** - Proper handling of device notches and camera cutouts
- **Universal URL Launcher** - Browse any website in full-screen
- **Gesture Controls** - Long-press to access navigation controls
- **Favorites & Recent** - Quick access to frequently visited sites
- **Offline Ready** - Service worker for offline functionality
- **Modern UI** - Beautiful dark theme with smooth animations
- **PWA Installable** - Add to home screen for native-app experience

## 📱 Installation

### On Mobile Device

1. **Open in Browser**
   - Open Chrome (Android) or Safari (iOS)
   - Navigate to your hosted URL or use a local server

2. **Install to Home Screen**
   - **Android Chrome**: Tap the menu (⋮) → "Add to Home screen"
   - **iOS Safari**: Tap Share (↗) → "Add to Home Screen"

3. **Launch**
   - Tap the app icon from your home screen
   - Enjoy true full-screen browsing!

### Local Development

1. **Serve the App**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Access on Mobile**
   - Find your computer's local IP address
   - On mobile, navigate to `http://[YOUR_IP]:8000`
   - Follow installation steps above

## 🎮 How to Use

### Browsing Websites

1. **Enter URL** - Type any web address in the input field
   - Examples: `google.com`, `youtube.com`, `github.com`
   - Or search directly: `weather today`

2. **Navigate** - The website loads in true full-screen mode

3. **Access Controls** - Long-press anywhere on the screen for 500ms
   - A floating button appears in the bottom-right
   - Tap it to open the control panel

### Control Panel Functions

- **← Back** - Navigate back in browser history
- **🏠 Home** - Return to the app home screen
- **↻ Refresh** - Reload the current website
- **⭐ Favorite** - Add/remove from favorites
- **↗ Share** - Share the current URL

### Favorites & Recent

- **Add to Favorites** - Use the star button in controls
- **Quick Access** - Tap any favorite or recent item from home screen
- **Remove Favorite** - Tap the ✕ on any favorite card

## 🔧 Technical Details

### Files Structure

```
remove notch and other things app/
├── index.html          # Main app structure
├── style.css           # Styles with safe-area handling
├── app.js              # Application logic
├── manifest.json       # PWA configuration
├── sw.js               # Service worker
├── icon-192.png        # App icon (192x192)
└── icon-512.png        # App icon (512x512)
```

### Key Technologies

- **PWA Manifest** - `"display": "fullscreen"` for edge-to-edge rendering
- **Service Worker** - Cache-first strategy for offline support
- **CSS Safe Areas** - `env(safe-area-inset-*)` for notch handling
- **LocalStorage** - Favorites and recent URLs persistence
- **Modern JavaScript** - ES6+ features, async/await

### Browser Compatibility

- ✅ Chrome/Edge (Android) - Full support
- ✅ Safari (iOS) - Full support
- ⚠️ Firefox (Android) - Limited fullscreen support
- ❌ Desktop browsers - Works but not intended use case

## ⚠️ Limitations

### X-Frame-Options

Some websites prevent embedding in iframes (e.g., Facebook, Instagram):
- These sites cannot be displayed within the app
- The app will show an error and offer to open in external browser
- This is a security feature enforced by those websites

### Known Working Sites

- ✅ Google, YouTube, Wikipedia
- ✅ Reddit, Twitter/X
- ✅ GitHub, Stack Overflow
- ✅ News sites (most)
- ❌ Facebook, Instagram
- ❌ Banking sites (security restricted)

## 🎨 Customization

### Change Theme Colors

Edit `style.css` and `manifest.json`:

```css
/* style.css */
:root {
  --accent-primary: #3b82f6;  /* Change to your color */
  --accent-secondary: #8b5cf6;
  --bg-primary: #0f172a;
}
```

```json
// manifest.json
{
  "theme_color": "#0f172a",
  "background_color": "#0f172a"
}
```

### Modify Gestures

In `app.js`, adjust the long-press duration:

```javascript
setTimeout(() => {
  // Show control button
}, 500); // Change to desired milliseconds
```

## 🐛 Troubleshooting

### App Not Installing
- Ensure HTTPS or localhost is used
- Check manifest.json is properly linked
- Verify service worker registers successfully

### Notch Area Issues
- Check device supports `env(safe-area-inset-*)`
- Ensure viewport meta tag includes `viewport-fit=cover`
- Test on actual device, not simulator

### Controls Not Showing
- Try long-pressing (500ms) on the screen
- Check if touch events are enabled
- Verify JavaScript console for errors

## 📄 License

Free to use and modify for any purpose.

## 🙏 Credits

Built with modern web standards and love for immersive mobile experiences.

---

**Enjoy browsing in true full-screen! 🚀**
