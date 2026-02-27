/**
 * ArticFox Storage
 * Handles all localStorage operations
 */

import { state } from './state.js';
import { CONFIG } from './config.js';

export const Storage = {
    KEYS: {
        FOLDERS: "foldersData",
        ALIGN: "foldersAlign",
        BG: "customBg",
        VISIBLE: "foldersVisible",
        SEARCH_HISTORY: "searchHistory"
    },

    load() {
        try {
            const folders = localStorage.getItem(this.KEYS.FOLDERS);
            const align = localStorage.getItem(this.KEYS.ALIGN);
            const bg = localStorage.getItem(this.KEYS.BG);
            const visible = localStorage.getItem(this.KEYS.VISIBLE);
            const history = localStorage.getItem(this.KEYS.SEARCH_HISTORY);

            if (folders) state.setFolders(JSON.parse(folders));
            if (align) state.setAlignment(align);
            if (history) state.searchHistory = JSON.parse(history);

            return { bg, visible: visible !== null ? JSON.parse(visible) : CONFIG.DEFAULTS.foldersVisible };
        } catch (e) {
            console.error("Storage load error:", e);
            return { bg: null, visible: CONFIG.DEFAULTS.foldersVisible };
        }
    },

    save() {
        localStorage.setItem(this.KEYS.FOLDERS, JSON.stringify(state.folders));
    },

    saveAlignment() {
        localStorage.setItem(this.KEYS.ALIGN, state.alignment);
    },

    saveVisibility(visible) {
        localStorage.setItem(this.KEYS.VISIBLE, JSON.stringify(visible));
    },

    saveSearchHistory() {
        localStorage.setItem(this.KEYS.SEARCH_HISTORY, JSON.stringify(state.searchHistory));
    },

    saveBackground(dataUrl) {
        localStorage.setItem(this.KEYS.BG, dataUrl);
    },

    exportData() {
        const cleanData = state.folders.map(folder => ({
            id: folder.id || Date.now().toString(),
            name: folder.name || "Unnamed",
            icon: folder.icon || "folder",
            shortcuts: (folder.shortcuts || []).map(s => ({
                name: s.name || "Unnamed",
                link: s.link || "#",
                icon: s.icon || null
            }))
        }));
        return JSON.stringify(cleanData, null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) throw new Error("Invalid format: must be array");
            
            const validFolders = data.filter(folder => 
                folder && typeof folder === 'object' && folder.id && folder.name
            ).map(folder => ({
                id: String(folder.id),
                name: String(folder.name),
                icon: folder.icon || 'folder',
                shortcuts: (Array.isArray(folder.shortcuts) ? folder.shortcuts : [])
                    .filter(s => s && s.name)
                    .map(s => ({
                        name: s.name,
                        link: s.link || '#',
                        icon: s.icon || null
                    }))
            }));

            if (validFolders.length === 0) throw new Error("No valid folders found");
            
            state.setFolders(validFolders);
            this.save();
            return validFolders.length;
        } catch (err) {
            throw err;
        }
    }
};