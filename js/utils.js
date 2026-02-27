/**
 * ArticFox Utilities
 * Helper functions used across the application
 */

export const Utils = {
    /**
     * Generate favicon URL from website URL
     */
    getFavicon(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) { 
            return ""; 
        }
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString();
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Read file as Data URL
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Wait for Lucide to be available
     */
    waitForLucide(callback, maxAttempts = 20) {
        let attempts = 0;
        const checkLucide = setInterval(() => {
            attempts++;
            if (window.lucide && typeof lucide.createIcons === 'function') {
                clearInterval(checkLucide);
                console.log("✓ Lucide loaded successfully");
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkLucide);
                console.error("✗ Lucide failed to load after", attempts, "attempts");
            }
        }, 100);
    }
};