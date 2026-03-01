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

export const Network = {
    /**
     * Mesure la vitesse de téléchargement
     * @param {string} url - URL du fichier de test ( ~ 2-5 Mo)
     */
    async measureDownloadSpeed(url) {
        const startTime = performance.now();
        
        try {
            // On ajoute un timestamp aléatoire pour éviter le cache navigateur
            const response = await fetch(`${url}?t=${Date.now()}`, {
                cache: "no-store", // Interdit formellement l'enregistrement sur le disque
                mode: "cors"
            });
            const blob = await response.blob();
            const endTime = performance.now();
            
            const duration = (endTime - startTime) / 1000; // en secondes
            const bitsLoaded = blob.size * 8;
            const speedMbps = (bitsLoaded / duration) / 1000000;
            
            return speedMbps.toFixed(2);
        } catch (error) {
            console.error("SpeedTest échoué:", error);
            return null;
        }
    }
};

export const GitHub = {
    async fetchRepos(username) {
        try {
            // On récupère les repos publics triés par mise à jour récente
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
            if (!response.ok) throw new Error("Utilisateur non trouvé");
            
            const repos = await response.ok ? await response.json() : [];
            return repos.map(repo => ({
                name: repo.name,
                url: repo.html_url,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count
            }));
        } catch (error) {
            console.error("Erreur GitHub:", error);
            return null;
        }
    }
};