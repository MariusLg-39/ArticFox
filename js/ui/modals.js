/**
 * ArticFox Modals
 * Handles modal operations and form management
 */

import { state } from '../state.js';
import { CONFIG } from '../config.js';
import { Icons } from './icons.js';
import { Renderer } from './renderer.js';
import { Storage } from '../storage.js';
import { Utils } from '../utils.js';

export const Modals = {
    dom: {},

    initDOM(refs) {
        this.dom = refs;
    },

    /**
     * Reset folder modal to default state
     */
    resetFolderModal() {
        this.dom.folderNameInput.value = "";
        const defaultIcon = CONFIG.DEFAULTS.folderIcon;
        this.dom.selectedFolderIcon.value = defaultIcon;
        
        this.dom.iconPicker.querySelectorAll(".icon-option").forEach(el => {
            el.classList.toggle("selected", el.dataset.icon === defaultIcon);
        });

        Icons.updatePreview("iconPreview", defaultIcon);
    },

    /**
     * Reset shortcut modal
     */
    resetShortcutModal() {
        this.dom.shortcutNameInput.value = "";
        this.dom.shortcutLinkInput.value = "";
        this.dom.shortcutIconInput.value = "";
    },

    /**
     * Open edit modal for folder or shortcut
     */
    openEdit(type, obj) {
        state.setEdit(type, obj);
        this.dom.editName.value = obj.name;
        const isFolder = type === "folder";

        if (this.dom.editFolderIconSection) {
            this.dom.editFolderIconSection.classList.toggle("hidden", !isFolder);
        }
        if (this.dom.editShortcutSection) {
            this.dom.editShortcutSection.classList.toggle("hidden", isFolder);
        }

        if (isFolder) {
            const currentIcon = obj.icon || "folder";
            this.dom.editSelectedIcon.value = currentIcon;
            
            Icons.renderPicker(
                this.dom.editIconPicker, 
                this.dom.editSelectedIcon, 
                currentIcon,
                (iconName) => Icons.updatePreview("editIconPreview", iconName)
            );
            
            Icons.updatePreview("editIconPreview", currentIcon);
        } else {
            if (this.dom.editLink) this.dom.editLink.value = obj.link || "";
        }

        this.dom.editModal.classList.remove("hidden");
    },

    /**
     * Create new folder
     */
    createFolder() {
        const name = this.dom.folderNameInput.value.trim();
        if (!name) return alert("Name required");
        
        state.folders.push({
            id: Utils.generateId(),
            name,
            icon: this.dom.selectedFolderIcon.value,
            shortcuts: []
        });
        
        Storage.save();
        Renderer.folders();
        this.dom.folderModal.classList.add("hidden");
    },

    /**
     * Create new shortcut
     */
    async createShortcut() {
        const name = this.dom.shortcutNameInput.value.trim();
        const link = this.dom.shortcutLinkInput.value.trim();
        const folder = state.selectedFolder;
        
        if (!name || !folder) return alert("Name and folder required");
        
        const newShortcut = {
            name,
            link: link || "#",
            icon: Utils.getFavicon(link)
        };

        const file = this.dom.shortcutIconInput.files[0];
        if (file) {
            newShortcut.icon = await Utils.readFileAsDataURL(file);
        }

        folder.shortcuts.push(newShortcut);
        Storage.save();
        Renderer.shortcuts(folder);
        this.dom.shortcutModal.classList.add("hidden");
        this.resetShortcutModal();
    },

    /**
     * Save edit changes
     */
    async saveEdit() {
        const newName = this.dom.editName.value.trim();
        if (!newName) return alert("Name is required");

        const { type, obj } = state.currentEdit;

        if (type === "folder") {
            obj.name = newName;
            obj.icon = this.dom.editSelectedIcon.value;
            Storage.save();
            Renderer.folders();
            this.dom.editModal.classList.add("hidden");
        } else {
            obj.name = newName;
            const newLink = this.dom.editLink.value.trim();
            obj.link = newLink || obj.link;
            
            const updateAndClose = () => {
                Storage.save();
                Renderer.shortcuts(state.selectedFolder);
                this.dom.editModal.classList.add("hidden");
            };

            if (this.dom.editIcon.files[0]) {
                obj.icon = await Utils.readFileAsDataURL(this.dom.editIcon.files[0]);
                updateAndClose();
            } else {
                obj.icon = Utils.getFavicon(obj.link);
                updateAndClose();
            }
        }
    },

    /**
     * Delete current edit item
     */
    deleteEdit() {
        const { type, obj } = state.currentEdit;

        if (type === "folder") {
            state.setFolders(state.folders.filter(f => f.id !== obj.id));
            if (state.selectedFolderId === obj.id) {
                this.dom.shortcutsContainer.classList.add("hidden");
                state.setSelectedFolder(null);
            }
            Renderer.folders();
        } else {
            const folder = state.selectedFolder;
            folder.shortcuts = folder.shortcuts.filter(s => s !== obj);
            Renderer.shortcuts(folder);
        }
        
        Storage.save();
        this.dom.editModal.classList.add("hidden");
    },

    /**
     * Close all modals
     */
    closeAll() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add("hidden"));
    }
};