/**
 * ArticFox - Modular Homepage Extension
 * Main Application Entry Point
 */

import { state } from './state.js';
import { Storage } from './storage.js';
import { Utils } from './utils.js';
import { Icons } from './ui/icons.js';
import { Renderer } from './ui/renderer.js';
import { Modals } from './ui/modals.js';
import { Search } from './ui/search.js';
import { Sidebar } from './ui/sidebar.js';
import { DragDrop } from './handlers/dragdrop.js';
import { Events } from './handlers/events.js';
import { CONFIG } from './config.js';

/**
 * DOM References
 */
const DOM = {
    // Search
    searchSuggestions: document.getElementById("searchSuggestions"),
    searchForm: document.getElementById("searchForm"),
    engineSelect: document.getElementById("engineSelect"),
    searchInput: document.getElementById("searchInput"),
    searchWrapper: document.querySelector(".search-wrapper"),
    
    // Icon pickers
    iconPicker: document.getElementById("iconPicker"),
    editIconPicker: document.getElementById("editIconPicker"),
    selectedFolderIcon: document.getElementById("selectedFolderIcon"),
    editSelectedIcon: document.getElementById("editSelectedIcon"),
    
    // Containers
    foldersContainer: document.getElementById("foldersContainer"),
    foldersRow: document.getElementById("folders"),
    addFolderBtn: document.getElementById("addFolder"),
    shortcutsContainer: document.getElementById("shortcutsContainer"),
    shortcutsList: document.querySelector(".shortcuts-list"),
    
    // Modals
    folderModal: document.getElementById("folderModal"),
    shortcutModal: document.getElementById("shortcutModal"),
    editModal: document.getElementById("editModal"),
    
    // Inputs
    folderNameInput: document.getElementById("folderName"),
    shortcutNameInput: document.getElementById("shortcutName"),
    shortcutLinkInput: document.getElementById("shortcutLink"),
    shortcutIconInput: document.getElementById("shortcutIcon"),
    editName: document.getElementById("editName"),
    editLink: document.getElementById("editLink"),
    editIcon: document.getElementById("editIcon"),
    editFolderIconSection: document.getElementById("editFolderIconSection"),
    editShortcutSection: document.getElementById("editShortcutSection"),
    
    // Sidebar buttons
    settingsBtn: document.getElementById("settingsBtn"),
    settingsMenu: document.getElementById("settingsMenu"),
    dataBtn: document.getElementById("dataBtn"),
    dataMenu: document.getElementById("dataMenu"),
    BgBtn: document.getElementById("BgBtn"),
    BgMenu: document.getElementById("BgMenu"),
    alignBtn: document.getElementById("alignBtn"),
    alignMenu: document.getElementById("alignMenu"),
    toggleBtn: document.getElementById("toggleFolders"),
    bgInput: document.getElementById("bgInput"),
    bgInputMenu: document.getElementById("bgInputMenu"),
    importInput: document.getElementById("importInput")
};

/**
 * Initialize Application
 */
function initApp() {
    console.log("🦊 Initializing ArticFox...");
    
    // Load data from storage
    const { bg, visible } = Storage.load();
    
    // Initialize DOM references in modules
    Renderer.initDOM(DOM);
    Modals.initDOM(DOM);
    Search.initDOM(DOM);
    Sidebar.initDOM(DOM);
    Events.initDOM(DOM);
    
    // Initialize icon pickers
    Icons.renderPicker(
        DOM.iconPicker, 
        DOM.selectedFolderIcon, 
        CONFIG.DEFAULTS.folderIcon,
        (iconName) => Icons.updatePreview("iconPreview", iconName)
    );
    
    // Render initial state
    Renderer.folders();
    
    // Initialize drag & drop
    DragDrop.initFolders(DOM.foldersRow);
    DragDrop.initShortcuts(DOM.shortcutsList);
    
    // Initialize event listeners
    Events.init();
    
    // Apply saved settings
    if (bg) document.body.style.backgroundImage = `url(${bg})`;
    DOM.foldersContainer.classList.toggle("hidden", !visible);
    Icons.updateToggleIcon(DOM.toggleBtn, visible);
    
    // Setup icon search filters
    setupIconFilters();
    
    console.log("✅ ArticFox initialized successfully");
}

/**
 * Setup icon filter inputs
 */
function setupIconFilters() {
    const filterIcons = (input, container) => {
        input.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            container.querySelectorAll(".icon-option").forEach(icon => {
                const name = icon.dataset.icon.toLowerCase();
                icon.style.display = name.includes(term) ? "flex" : "none";
            });
        });
    };

    const iconSearch = document.getElementById("iconSearch");
    const editIconSearch = document.getElementById("editIconSearch");
    
    if (iconSearch) filterIcons(iconSearch, DOM.iconPicker);
    if (editIconSearch) filterIcons(editIconSearch, DOM.editIconPicker);
}

// Wait for Lucide then initialize
Utils.waitForLucide(initApp);