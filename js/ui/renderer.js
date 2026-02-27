/**
 * ArticFox Renderer
 * Handles all DOM rendering operations
 */

import { state } from '../state.js';
import { Icons } from './icons.js';
import { Utils } from '../utils.js';

export const Renderer = {
    dom: {},

    /**
     * Initialize DOM references
     */
    initDOM(refs) {
        this.dom = refs;
    },

    /**
     * Render all folders
     */
    folders() {
        const fragment = document.createDocumentFragment();
        this.dom.foldersRow.innerHTML = "";
        
        state.folders.forEach(folder => {
            const div = document.createElement("div");
            div.className = "folder";
            div.dataset.id = folder.id;
            div.draggable = true;
            div.innerHTML = `
                <i data-lucide="${folder.icon || 'folder'}" class="folder-icon-svg"></i>
                <span>${folder.name}</span>
                <img src="icons/gear.svg" class="edit-btn" data-action="edit-folder">
            `;
            fragment.appendChild(div);
        });
        
        fragment.appendChild(this.dom.addFolderBtn);
        this.dom.foldersRow.appendChild(fragment);
        this.applyAlignment(state.alignment);
        Icons.initAll();
    },

    /**
     * Render shortcuts for a folder
     */
    shortcuts(folder) {
        if (!folder) return;
        
        this.dom.shortcutsList.innerHTML = "";
        const fragment = document.createDocumentFragment();
        
        folder.shortcuts.forEach((shortcut, index) => {
            const a = document.createElement("a");
            a.className = "shortcut";
            a.href = shortcut.link || "#";
            a.target = "_blank";
            a.dataset.index = index;
            
            const iconHtml = shortcut.icon 
                ? `<img src="${shortcut.icon}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;">` 
                : `<i data-lucide="globe" style="width:32px; height:32px;"></i>`;
                
            a.innerHTML = `
                ${iconHtml}
                <span title="${shortcut.name}">${shortcut.name}</span>
                <img src="icons/gear.svg" class="edit-btn" data-action="edit-shortcut">
            `;
            fragment.appendChild(a);
        });

        // Add button
        const addBtn = document.createElement("div");
        addBtn.className = "shortcut placeholder";
        addBtn.innerHTML = `<i data-lucide="plus" style="width:24px; height:24px;"></i>`;
        addBtn.onclick = (e) => { 
            e.stopPropagation(); 
            this.dom.shortcutModal.classList.remove("hidden"); 
        };
        fragment.appendChild(addBtn);

        this.dom.shortcutsList.appendChild(fragment);
        
        // Update grid columns
        const columns = Math.min(folder.shortcuts.length + 1, 7);
        this.dom.shortcutsList.style.gridTemplateColumns = `repeat(${columns}, 80px)`;
        
        Icons.initAll();
        this.positionShortcuts();
    },

    /**
     * Position shortcuts container below selected folder
     */
    positionShortcuts() {
    // On récupère l'élément du dossier sélectionné
    const folderId = state.selectedFolderId;
    if (!folderId) return;
    
    const folderEl = this.dom.foldersRow.querySelector(`[data-id="${folderId}"]`);
    if (!folderEl) return;

    // IMPORTANT : On retire la condition "if container is hidden return" 
    // pour permettre le calcul juste avant l'affichage.

    requestAnimationFrame(() => {
        const folderRect = folderEl.getBoundingClientRect();
        const container = this.dom.shortcutsContainer;
        const list = this.dom.shortcutsList;
        
        // On force l'affichage temporaire pour calculer le offsetWidth réel
        // sinon offsetWidth vaut 0 si le parent est en display: none
        const originalVisibility = container.style.visibility;
        const originalDisplay = container.style.display;
        
        container.style.visibility = "hidden";
        container.style.display = "block";

        const listWidth = list.offsetWidth;
        const gap = 12;
        const padding = 20;

        // Calcul vertical
        container.style.top = `${folderRect.bottom + window.scrollY + gap}px`;

        // Calcul horizontal (centrage)
        let leftPos = (folderRect.left + (folderRect.width / 2)) - (listWidth / 2);

        // Garder dans l'écran
        if (leftPos < padding) leftPos = padding;
        if (leftPos + listWidth > window.innerWidth - padding) {
            leftPos = window.innerWidth - listWidth - padding;
        }

        container.style.left = `${leftPos}px`;

        // On rétablit les styles d'origine
        container.style.visibility = originalVisibility;
        container.style.display = originalDisplay;
    });
},

    /**
     * Apply folder alignment
     */
    applyAlignment(align) {
        const folders = this.dom.foldersRow;
        if (!folders) return;

        // Reset margins
        Array.from(folders.children).forEach(child => {
            child.style.marginLeft = "0";
            child.style.marginRight = "0";
        });

        if (align === "left") {
            folders.style.justifyContent = "flex-start";
            folders.style.marginLeft = "40px";
            folders.style.marginRight = "auto";
        } else if (align === "right") {
            folders.style.justifyContent = "flex-end";
            folders.style.marginRight = "40px";
            folders.style.marginLeft = "auto";
        } else {
            folders.style.justifyContent = "center";
            folders.style.marginLeft = "auto";
            folders.style.marginRight = "auto";
        }
    },

    /**
     * Close shortcuts with animation
     */
    closeShortcuts() {
    if (this.dom.shortcutsContainer.classList.contains("hidden")) return;
    
    this.dom.shortcutsContainer.classList.add("animate-out");
    this.dom.shortcutsContainer.classList.remove("animate-in");
    
    setTimeout(() => {
        this.dom.shortcutsContainer.classList.add("hidden");
        this.dom.shortcutsContainer.classList.remove("animate-out");
        state.setSelectedFolder(null);
    }, 200); // Doit correspondre à la durée de ton animation CSS
},

    /**
     * Switch between folders with animation
     */
    switchShortcuts(folder) {
        this.dom.shortcutsList.classList.add("switching");
        
        setTimeout(() => {
            this.shortcuts(folder);
            this.dom.shortcutsList.classList.remove("switching");
        }, 150);
    }
};