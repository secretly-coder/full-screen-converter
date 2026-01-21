// ============================================================================
// State Management
// ============================================================================

let currentUrl = '';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let recentUrls = JSON.parse(localStorage.getItem('recentUrls') || '[]');
let deferredPrompt = null;
let longPressTimer = null;
let controlsVisible = false;

// ============================================================================
// DOM Elements
// ============================================================================

const homeScreen = document.getElementById('homeScreen');
const browserScreen = document.getElementById('browserScreen');
const urlInput = document.getElementById('urlInput');
const goButton = document.getElementById('goButton');
const browserFrame = document.getElementById('browserFrame');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const openExternalButton = document.getElementById('openExternalButton');
const errorBackButton = document.getElementById('errorBackButton');
const controlButton = document.getElementById('controlButton');
const showControlsButton = document.getElementById('showControlsButton');
const controlPanel = document.getElementById('controlPanel');
const closeControlsButton = document.getElementById('closeControlsButton');
const backButton = document.getElementById('backButton');
const homeButton = document.getElementById('homeButton');
const refreshButton = document.getElementById('refreshButton');
const favoriteButton = document.getElementById('favoriteButton');
const favoriteText = document.getElementById('favoriteText');
const shareButton = document.getElementById('shareButton');
const currentUrlInput = document.getElementById('currentUrlInput');
const favoritesList = document.getElementById('favoritesList');
const recentList = document.getElementById('recentList');
const installButton = document.getElementById('installButton');

// ============================================================================
// Service Worker Registration
// ============================================================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}

// ============================================================================
// PWA Install Prompt
// ============================================================================

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.classList.remove('hidden');
    installButton.classList.add('visible');
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Install prompt outcome: ${outcome}`);
        deferredPrompt = null;
        installButton.classList.remove('visible');
        setTimeout(() => {
            installButton.classList.add('hidden');
        }, 300);
    }
});

// ============================================================================
// URL Handling
// ============================================================================

function normalizeUrl(url) {
    url = url.trim();

    // If already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If looks like a domain (contains a dot), add https://
    if (url.includes('.')) {
        return 'https://' + url;
    }

    // Otherwise, search with Google
    return 'https://www.google.com/search?q=' + encodeURIComponent(url);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function getDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

function getIcon(url) {
    try {
        const domain = getDomain(url);
        return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch {
        return '🌐';
    }
}

function renderIcon(url, isEmoji = false) {
    if (isEmoji) return `<span class="icon-placeholder">${url}</span>`;
    const iconUrl = getIcon(url);
    return `<img src="${iconUrl}" class="site-favicon" onerror="this.src='/logo.png'">`;
}

// ============================================================================
// Browser Navigation
// ============================================================================

function navigateToUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
        alert('Invalid URL. Please enter a valid web address.');
        return;
    }

    currentUrl = normalizedUrl;
    addToRecent(normalizedUrl);
    loadUrlInBrowser(normalizedUrl);
    showScreen('browser');
    updateFavoriteButton();
}

function loadUrlInBrowser(url) {
    // Show loading
    loadingIndicator.classList.add('active');
    errorMessage.classList.remove('active');

    // Load URL
    browserFrame.src = url;
    currentUrlInput.value = url;

    // Handle iframe load/error
    const loadTimeout = setTimeout(() => {
        loadingIndicator.classList.remove('active');
    }, 5000);

    browserFrame.onload = () => {
        clearTimeout(loadTimeout);
        loadingIndicator.classList.remove('active');
    };

    browserFrame.onerror = () => {
        clearTimeout(loadTimeout);
        showError('Security Restricted: This website (like Google or YouTube) prohibits being displayed inside other apps for security reasons. Please use the button below to open it in a full browser tab.');
    };

    // Check for X-Frame-Options by attempting to access iframe
    setTimeout(() => {
        try {
            const iframeDoc = browserFrame.contentDocument || browserFrame.contentWindow.document;
            if (!iframeDoc) {
                throw new Error('Cannot access iframe content');
            }
        } catch (e) {
            // This is expected for cross-origin iframes
            // Only show error if the iframe is actually empty/blocked
        }
    }, 2000);
}

function showError(message) {
    loadingIndicator.classList.remove('active');
    errorMessage.classList.add('active');
    errorText.textContent = message;
}

function showScreen(screenName) {
    if (screenName === 'home') {
        homeScreen.classList.add('active');
        browserScreen.classList.remove('active');
        hideControls();
    } else if (screenName === 'browser') {
        homeScreen.classList.remove('active');
        browserScreen.classList.add('active');
    }
}

// ============================================================================
// Favorites Management
// ============================================================================

function addToFavorites(url) {
    if (!favorites.some(f => f.url === url)) {
        favorites.unshift({
            url: url,
            name: getDomain(url),
            icon: getIcon(url),
            timestamp: Date.now()
        });

        // Limit to 12 favorites
        if (favorites.length > 12) {
            favorites = favorites.slice(0, 12);
        }

        saveFavorites();
        renderFavorites();
        updateFavoriteButton();
    }
}

function removeFromFavorites(url) {
    favorites = favorites.filter(f => f.url !== url);
    saveFavorites();
    renderFavorites();
    updateFavoriteButton();
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function renderFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No favorites yet. Add some!</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map(fav => `
    <div class="favorite-item" data-url="${fav.url}">
      <button class="delete-favorite" data-url="${fav.url}">✕</button>
      <div class="favorite-icon-container">${renderIcon(fav.url)}</div>
      <div class="favorite-name">${fav.name}</div>
    </div>
  `).join('');

    // Add click handlers
    favoritesList.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-favorite')) {
                navigateToUrl(item.dataset.url);
            }
        });
    });

    favoritesList.querySelectorAll('.delete-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromFavorites(btn.dataset.url);
        });
    });
}

function updateFavoriteButton() {
    const isFavorite = favorites.some(f => f.url === currentUrl);
    favoriteText.textContent = isFavorite ? 'Remove Favorite' : 'Add to Favorites';
}

// ============================================================================
// Recent URLs Management
// ============================================================================

function addToRecent(url) {
    // Remove if already exists
    recentUrls = recentUrls.filter(r => r.url !== url);

    // Add to beginning
    recentUrls.unshift({
        url: url,
        name: getDomain(url),
        icon: getIcon(url),
        timestamp: Date.now()
    });

    // Limit to 10 recent
    if (recentUrls.length > 10) {
        recentUrls = recentUrls.slice(0, 10);
    }

    saveRecent();
    renderRecent();
}

function saveRecent() {
    localStorage.setItem('recentUrls', JSON.stringify(recentUrls));
}

function renderRecent() {
    if (recentUrls.length === 0) {
        recentList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No recent sites yet.</p>';
        return;
    }

    recentList.innerHTML = recentUrls.map(recent => `
    <div class="recent-item" data-url="${recent.url}">
      <div class="recent-icon-container">${renderIcon(recent.url)}</div>
      <div class="recent-info">
        <div class="recent-name">${recent.name}</div>
        <div class="recent-url">${recent.url}</div>
      </div>
    </div>
  `).join('');

    // Add click handlers
    recentList.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateToUrl(item.dataset.url);
        });
    });
}

// ============================================================================
// Control Panel & Gestures
// ============================================================================

function showControls() {
    if (!controlsVisible) {
        controlPanel.classList.add('visible');
        controlsVisible = true;
    }
}

function hideControls() {
    if (controlsVisible) {
        controlPanel.classList.remove('visible');
        controlsVisible = false;
    }
}

function toggleControls() {
    if (controlsVisible) {
        hideControls();
    } else {
        showControls();
    }
}

// Long-press detection to show control button
let longPressStartTime = 0;

browserScreen.addEventListener('touchstart', (e) => {
    longPressStartTime = Date.now();

    longPressTimer = setTimeout(() => {
        // Show control button after 500ms long press
        if (!controlsVisible) {
            controlButton.classList.remove('hidden');
            controlButton.classList.add('visible');

            // Hide after 3 seconds if not clicked
            setTimeout(() => {
                if (!controlsVisible) {
                    controlButton.classList.remove('visible');
                    setTimeout(() => {
                        controlButton.classList.add('hidden');
                    }, 300);
                }
            }, 3000);

            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }, 500);
});

browserScreen.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
});

browserScreen.addEventListener('touchmove', () => {
    clearTimeout(longPressTimer);
});

// ============================================================================
// Event Listeners
// ============================================================================

// URL Input
goButton.addEventListener('click', () => {
    if (urlInput.value.trim()) {
        navigateToUrl(urlInput.value);
        urlInput.value = '';
    }
});

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && urlInput.value.trim()) {
        navigateToUrl(urlInput.value);
        urlInput.value = '';
    }
});

// Control buttons
showControlsButton.addEventListener('click', () => {
    showControls();
});

closeControlsButton.addEventListener('click', () => {
    hideControls();
});

backButton.addEventListener('click', () => {
    try {
        browserFrame.contentWindow.history.back();
    } catch (e) {
        console.log('Cannot access iframe history');
    }
    hideControls();
});

homeButton.addEventListener('click', () => {
    showScreen('home');
    currentUrl = '';
    browserFrame.src = 'about:blank';
});

refreshButton.addEventListener('click', () => {
    if (currentUrl) {
        loadUrlInBrowser(currentUrl);
    }
    hideControls();
});

favoriteButton.addEventListener('click', () => {
    const isFavorite = favorites.some(f => f.url === currentUrl);

    if (isFavorite) {
        removeFromFavorites(currentUrl);
    } else {
        addToFavorites(currentUrl);
    }

    hideControls();
});

shareButton.addEventListener('click', async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: getDomain(currentUrl),
                url: currentUrl
            });
        } catch (e) {
            console.log('Share cancelled or failed:', e);
        }
    } else {
        // Fallback: copy to clipboard
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(currentUrl);
            alert('URL copied to clipboard!');
        }
    }
    hideControls();
});

// Error screen buttons
openExternalButton.addEventListener('click', () => {
    window.open(currentUrl, '_blank');
});

errorBackButton.addEventListener('click', () => {
    showScreen('home');
    errorMessage.classList.remove('active');
});

// ============================================================================
// Initialization
// ============================================================================

function init() {
    renderFavorites();
    renderRecent();

    // Add some default favorites if none exist
    if (favorites.length === 0) {
        addToFavorites('https://google.com');
        addToFavorites('https://youtube.com');
        addToFavorites('https://github.com');
    }

    console.log('Full-Screen Browser initialized');
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle app being installed
window.addEventListener('appinstalled', (evt) => {
    console.log('App installed successfully');
    installButton.classList.remove('visible');
    setTimeout(() => {
        installButton.classList.add('hidden');
    }, 300);
});

// Prevent accidental back navigation
let isAtHomeScreen = true;
window.addEventListener('popstate', (e) => {
    if (isAtHomeScreen) {
        e.preventDefault();
        history.pushState(null, '', location.href);
    }
});

history.pushState(null, '', location.href);
