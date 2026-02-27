/**
 * ArticFox Events
 * Global event listeners and handlers
 */

import { state } from '../state.js';
import { Modals } from '../ui/modals.js';
import { Search } from '../ui/search.js';
import { Sidebar } from '../ui/sidebar.js';
import { Renderer } from '../ui/renderer.js';
import { ImportExport } from './importexport.js';

export const Events = {
    dom: {},

    initDOM(refs) {
        this.dom = refs;
    },

    /**
     * Initialize all event listeners
     */
    init() {
        this.initFolderClicks();
        this.initModalButtons();
        this.initSidebarButtons();
        this.initSearch();
        this.initGlobal();
    },

    /**
     * Folder click handlers
     */
    initFolderClicks() {
        this.dom.foldersRow.onclick = (e) => {
            e.stopPropagation();
            const folderEl = e.target.closest(".folder");
            if (!folderEl || folderEl.id === "addFolder") return;

            const id = folderEl.dataset.id;
            const folder = state.folders.find(f => f.id === id);

            if (e.target.dataset.action === "edit-folder") {
                Modals.openEdit("folder", folder);
                return;
            }

            // Toggle if same folder clicked
            if (state.selectedFolderId === id) {
                Renderer.closeShortcuts();
                return;
            }

            // Switch with animation if already open
            if (state.selectedFolderId !== null && !this.dom.shortcutsContainer.classList.contains("hidden")) {
                Renderer.switchShortcuts(folder);
                state.setSelectedFolder(id);
            } else {
                state.setSelectedFolder(id);
                Renderer.shortcuts(folder);
                this.dom.shortcutsContainer.classList.remove("hidden");
            }
        };
    },

    /**
     * Modal button handlers
     */
    initModalButtons() {
        // Cancel buttons
        document.querySelectorAll(".cancel-btn").forEach(btn => {
            btn.onclick = () => btn.closest(".modal").classList.add("hidden");
        });

        // Create buttons
        document.getElementById("createFolder").onclick = () => Modals.createFolder();
        document.getElementById("createShortcut").onclick = () => Modals.createShortcut();
        document.getElementById("saveEdit").onclick = () => Modals.saveEdit();
        document.getElementById("deleteEdit").onclick = () => Modals.deleteEdit();

        // Add folder button
        this.dom.addFolderBtn.onclick = (e) => {
            e.stopPropagation();
            this.dom.shortcutsContainer.classList.add("hidden");
            Modals.resetFolderModal();
            this.dom.folderModal.classList.remove("hidden");
        };
    },

    /**
     * Sidebar button handlers
     */
    initSidebarButtons() {
        this.dom.toggleBtn.onclick = () => Sidebar.toggleFolders();
        this.dom.settingsBtn.onclick = (e) => { e.stopPropagation(); Sidebar.toggleMenu('settings'); };
        this.dom.dataBtn.onclick = (e) => { e.stopPropagation(); Sidebar.toggleMenu('data'); };
        this.dom.BgBtn.onclick = (e) => { e.stopPropagation(); Sidebar.toggleMenu('bg'); };
        this.dom.alignBtn.onclick = (e) => { e.stopPropagation(); Sidebar.toggleMenu('align'); };

        // Alignment options
        document.querySelectorAll(".align-option").forEach(opt => {
            opt.onclick = (e) => {
                e.stopPropagation();
                Sidebar.setAlignment(opt.dataset.align);
            };
        });

        // Background inputs
        [this.dom.bgInput, this.dom.bgInputMenu].forEach(input => {
            if (input) input.onchange = (e) => Sidebar.handleBackgroundChange(e.target.files[0]);
        });

        // Import/Export
        document.getElementById("exportBtn").onclick = () => ImportExport.export();
        document.getElementById("importBtn").onclick = () => this.dom.importInput.click();
        this.dom.importInput.onchange = (e) => ImportExport.import(e.target.files[0]);
    },

    /**
     * Search handlers
     */
    initSearch() {
        this.dom.searchForm.onsubmit = (e) => Search.handleSubmit(e);
        this.dom.searchInput.oninput = (e) => Search.showSuggestions(e.target.value);
        this.dom.searchInput.onkeydown = (e) => Search.handleKeydown(e);
    },

    /**
     * Global event handlers
     */
    initGlobal() {
        // Click outside to close
        window.onclick = (e) => {
            // Close modals
            if (e.target.classList.contains('modal')) {
                e.target.classList.add("hidden");
            }

            // Close shortcuts
            const isFolder = e.target.closest('.folder');
            const isShortcuts = e.target.closest('#shortcutsContainer');
            const isModal = e.target.closest('.modal-content');
            
            if (!isFolder && !isShortcuts && !isModal) {
                Renderer.closeShortcuts();
            }

            // Close menus
            Sidebar.handleOutsideClick(e);
        };

        // Escape key
        window.onkeydown = (e) => {
            if (e.key === "Escape") {
                Renderer.closeShortcuts();
                Modals.closeAll();
                Sidebar.closeAllMenus();
            }
        };

        // Resize
        window.addEventListener("resize", () => Renderer.positionShortcuts());

        window.addEventListener('resize', () => {
    if (state.selectedFolderId) {
        Renderer.positionShortcuts();
    }
});
    }
};