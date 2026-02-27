/**
 * ArticFox Drag & Drop
 * Handles drag and drop for folders and shortcuts
 */

import { state } from '../state.js';
import { Storage } from '../storage.js';
import { Renderer } from '../ui/renderer.js';

export const DragDrop = {
    /**
     * Initialize folder drag and drop
     */
    initFolders(container) {
        container.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", e.target.dataset.id);
        };

        container.ondragover = (e) => e.preventDefault();

        container.ondrop = (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData("text/plain");
            const targetFolder = e.target.closest(".folder");
            
            if (!targetFolder || targetFolder.id === "addFolder" || draggedId === targetFolder.dataset.id) return;
            
            const draggedIdx = state.folders.findIndex(f => f.id === draggedId);
            const targetIdx = state.folders.findIndex(f => f.id === targetFolder.dataset.id);
            
            const [moved] = state.folders.splice(draggedIdx, 1);
            state.folders.splice(targetIdx, 0, moved);
            
            Storage.save();
            Renderer.folders();
        };
    },

    /**
     * Initialize shortcut drag and drop
     */
    initShortcuts(container) {
        container.ondragstart = (e) => {
            const shortcutEl = e.target.closest(".shortcut");
            if (!shortcutEl || shortcutEl.classList.contains("placeholder")) return;
            e.dataTransfer.setData("shortcutIndex", shortcutEl.dataset.index);
        };

        container.ondragover = (e) => e.preventDefault();

        container.ondrop = (e) => {
            e.preventDefault();
            const draggedIdx = parseInt(e.dataTransfer.getData("shortcutIndex"));
            const targetShortcut = e.target.closest(".shortcut");
            
            if (!targetShortcut || targetShortcut.classList.contains("placeholder")) return;
            
            const targetIdx = parseInt(targetShortcut.dataset.index);
            if (draggedIdx === targetIdx) return;

            const folder = state.selectedFolder;
            if (!folder) return;

            const [movedShortcut] = folder.shortcuts.splice(draggedIdx, 1);
            folder.shortcuts.splice(targetIdx, 0, movedShortcut);

            Storage.save();
            Renderer.shortcuts(folder);
        };
    }
};