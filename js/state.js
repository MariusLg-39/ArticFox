/**
 * ArticFox State Management
 * Centralized application state
 */

import { CONFIG } from './config.js';

class State {
    constructor() {
        this.foldersData = [];
        this.selectedFolderId = null;
        this.currentEdit = { type: null, obj: null };
        this.foldersAlign = CONFIG.DEFAULTS.alignment;
        this.searchHistory = [];
        this.debounceTimer = null;
        this.selectedSuggestionIndex = -1;
        this.dom = {};
    }

    // Getters
    get folders() { return this.foldersData; }
    get selectedFolder() { 
        return this.foldersData.find(f => f.id === this.selectedFolderId); 
    }
    get alignment() { return this.foldersAlign; }

    // Setters
    setFolders(data) { this.foldersData = data; }
    setSelectedFolder(id) { this.selectedFolderId = id; }
    setAlignment(align) { this.foldersAlign = align; }
    setEdit(type, obj) { this.currentEdit = { type, obj }; }
    clearEdit() { this.currentEdit = { type: null, obj: null }; }

    // Search history
    addSearch(query) {
        if (!query) return;
        this.searchHistory = [query, ...this.searchHistory.filter(item => item !== query)].slice(0, 10);
        return this.searchHistory;
    }
}

export const state = new State();