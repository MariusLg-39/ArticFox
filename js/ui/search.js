/**
 * ArticFox Search
 * Handles search bar, suggestions, and history
 */

import { state } from '../state.js';
import { CONFIG, SEARCH_ICONS } from '../config.js';
import { Storage } from '../storage.js';

export const Search = {
    dom: {},
    selectedIndex: -1,

    initDOM(refs) {
        this.dom = refs;
    },

    /**
     * Fetch suggestions from Google
     */
    fetchGoogleSuggestions(query) {
        return new Promise((resolve) => {
            const callbackName = 'googleCallback_' + Math.floor(Math.random() * 100000);
            
            window[callbackName] = (data) => {
                delete window[callbackName];
                const scriptTag = document.getElementById(callbackName);
                if (scriptTag) scriptTag.remove();
                
                const cleanData = data[1].map(item => {
                    if (Array.isArray(item)) return item[0];
                    if (typeof item === 'string') return item.split(',')[0];
                    return item;
                });
                
                resolve(cleanData);
            };

            const script = document.createElement('script');
            script.id = callbackName;
            script.src = `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodeURIComponent(query)}&callback=${callbackName}`;
            
            script.onerror = () => {
                delete window[callbackName];
                resolve([]);
            };

            document.body.appendChild(script);
        });
    },

    /**
     * Show search suggestions
     */
    async showSuggestions(value) {
        const query = value.toLowerCase().trim();
        
        if (query === "") {
            this.hideSuggestions();
            return;
        }

        clearTimeout(state.debounceTimer);
        state.debounceTimer = setTimeout(async () => {
            const googleSuggRaw = await this.fetchGoogleSuggestions(query);
            
            const localSugg = state.searchHistory
                .filter(item => item.toLowerCase().includes(query) && !googleSuggRaw.includes(item))
                .map(text => ({ text, type: 'history' }));

            const googleSugg = googleSuggRaw.map(text => ({ text, type: 'google' }));
            const allSuggestions = [...localSugg, ...googleSugg].slice(0, 8);

            this.renderSuggestions(allSuggestions);
        }, CONFIG.TIMING.suggestionDelay);
    },

    /**
     * Render suggestion items
     */
    renderSuggestions(suggestions) {
        this.dom.searchSuggestions.innerHTML = "";
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestions.forEach((sugg, index) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerHTML = `
                <span class="suggestion-icon">${sugg.type === 'history' ? SEARCH_ICONS.CLOCK : SEARCH_ICONS.SEARCH}</span>
                <span class="suggestion-text">${sugg.text}</span>
            `;

            div.onclick = (e) => {
                e.preventDefault();
                this.executeSearch(sugg.text);
            };

            this.dom.searchSuggestions.appendChild(div);
        });
        
        this.dom.searchSuggestions.classList.remove("hidden");
        this.dom.searchWrapper?.classList.add("active");
        this.selectedIndex = -1;
    },

    /**
     * Execute search
     */
    executeSearch(query) {
        this.dom.searchInput.value = query;
        state.addSearch(query);
        Storage.saveSearchHistory();
        
        const engineUrl = this.dom.engineSelect.value;
        window.location.href = engineUrl + encodeURIComponent(query);
    },

    /**
     * Hide suggestions
     */
    hideSuggestions() {
        this.dom.searchSuggestions.classList.add("hidden");
        this.dom.searchSuggestions.innerHTML = "";
        this.selectedIndex = -1;
        this.dom.searchWrapper?.classList.remove("active");
    },

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        const items = this.dom.searchSuggestions.querySelectorAll(".suggestion-item");
        
        if (this.dom.searchSuggestions.classList.contains("hidden") || items.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateSelected(items);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
            this.updateSelected(items);
        } else if (e.key === "Enter" && this.selectedIndex > -1) {
            e.preventDefault();
            const selectedText = items[this.selectedIndex].querySelector(".suggestion-text").innerText;
            this.executeSearch(selectedText);
        } else if (e.key === "Escape") {
            this.hideSuggestions();
        }
    },

    /**
     * Update selected suggestion styling
     */
    updateSelected(items) {
        items.forEach((item, idx) => {
            item.classList.toggle("selected", idx === this.selectedIndex);
        });
    },

    /**
     * Handle form submit
     */
    handleSubmit(e) {
        e.preventDefault();
        const query = this.dom.searchInput.value.trim();
        if (query) {
            this.executeSearch(query);
        }
    }
};