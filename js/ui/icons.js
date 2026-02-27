/**
 * ArticFox Icons
 * Handles Lucide icon rendering and management
 */

import { CONFIG } from '../config.js';

export const Icons = {
    /**
     * Initialize all Lucide icons in the document
     */
    initAll() {
        if (!window.lucide || typeof lucide.createIcons !== 'function') {
            console.error("Lucide not available");
            return;
        }
        try {
            lucide.createIcons();
            console.log("✓ Lucide icons initialized");
        } catch (e) {
            console.error("Error initializing Lucide:", e);
        }
    },

    /**
     * Initialize icons within a specific element
     */
    initForElement(element) {
        if (!window.lucide || typeof lucide.createIcons !== 'function') return;
        try {
            lucide.createIcons({ root: element });
        } catch (e) {
            console.error("Error initializing Lucide for element:", e);
        }
    },

    /**
     * Render icon picker grid
     */
    renderPicker(container, hiddenInput, selectedIcon, onSelect) {
        const fragment = document.createDocumentFragment();
        container.innerHTML = "";
        
        CONFIG.AVAILABLE_ICONS.forEach(iconName => {
            const div = document.createElement("div");
            div.className = `icon-option ${iconName === selectedIcon ? 'selected' : ''}`;
            div.dataset.icon = iconName;
            div.innerHTML = `<i data-lucide="${iconName}"></i>`;
            fragment.appendChild(div);
        });
        
        container.appendChild(fragment);
        
        container.onclick = (e) => {
            const option = e.target.closest(".icon-option");
            if (!option) return;
            
            const iconName = option.dataset.icon;
            container.querySelectorAll(".icon-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            
            hiddenInput.value = iconName;
            onSelect?.(iconName);
            this.initAll();
        };
        
        this.initAll();
    },

    /**
     * Update icon preview
     */
    updatePreview(elementId, iconName) {
        const previewDiv = document.getElementById(elementId);
        if (previewDiv) {
            previewDiv.innerHTML = `<i data-lucide="${iconName}"></i>`;
            this.initAll();
        }
    },

    /**
     * Update toggle button icon
     */
    updateToggleIcon(button, isVisible) {
        const iconName = isVisible ? 'folder-open' : 'folder';
        button.innerHTML = `<i data-lucide="${iconName}"></i>`;
        this.initForElement(button);
    }
};