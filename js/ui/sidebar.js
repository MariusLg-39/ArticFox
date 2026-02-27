/**
 * ArticFox Sidebar
 * Handles sidebar buttons and menus
 */

import { state } from '../state.js';
import { Icons } from './icons.js';
import { Renderer } from './renderer.js';
import { Storage } from '../storage.js';

export const Sidebar = {
    dom: {},
    menus: [],

    initDOM(refs) {
        this.dom = refs;
        this.menus = [
            { menu: this.dom.settingsMenu, btn: this.dom.settingsBtn },
            { menu: this.dom.dataMenu, btn: this.dom.dataBtn },
            { menu: this.dom.BgMenu, btn: this.dom.BgBtn },
            { menu: this.dom.alignMenu, btn: this.dom.alignBtn }
        ];
    },

    /**
     * Toggle folders visibility
     */
    toggleFolders() {
        const isHidden = this.dom.foldersContainer.classList.toggle("hidden");
        Storage.saveVisibility(!isHidden);
        Icons.updateToggleIcon(this.dom.toggleBtn, !isHidden);
    },

    /**
     * Toggle specific menu
     */
    toggleMenu(menuKey) {
        const config = {
            settings: { menu: this.dom.settingsMenu, btn: this.dom.settingsBtn },
            data: { menu: this.dom.dataMenu, btn: this.dom.dataBtn },
            bg: { menu: this.dom.BgMenu, btn: this.dom.BgBtn },
            align: { menu: this.dom.alignMenu, btn: this.dom.alignBtn }
        };

        const target = config[menuKey];
        if (!target) return;

        const isVisible = !target.menu.classList.contains("hidden");
        this.closeAllMenus();
        
        if (!isVisible) {
            target.menu.classList.remove("hidden");
            target.btn.classList.add("active");
        }
    },

    /**
     * Close all menus
     */
    closeAllMenus() {
        this.menus.forEach(({ menu, btn }) => {
            if (menu) menu.classList.add("hidden");
            if (btn) btn.classList.remove("active");
        });
    },

    /**
     * Handle click outside menus
     */
    handleOutsideClick(e) {
        this.menus.forEach(({ menu, btn }) => {
            if (menu && !menu.contains(e.target) && e.target !== btn) {
                menu.classList.add("hidden");
                btn?.classList.remove("active");
            }
        });
    },

    /**
     * Set folder alignment
     */
    setAlignment(align) {
        state.setAlignment(align);
        Storage.saveAlignment();
        Renderer.applyAlignment(align);
        setTimeout(() => Renderer.positionShortcuts(), 50);
        this.closeAllMenus();
    },

    /**
     * Handle background change
     */
    handleBackgroundChange(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            Storage.saveBackground(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};