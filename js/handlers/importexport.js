/**
 * ArticFox Import/Export
 * Handles data backup and restore
 */

import { Storage } from '../storage.js';
import { Renderer } from '../ui/renderer.js';
import { Icons } from '../ui/icons.js';

export const ImportExport = {
    /**
     * Export data to JSON file
     */
    export() {
        try {
            const json = Storage.exportData();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "articfox_backup_" + new Date().toISOString().slice(0, 10) + ".json";
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed: " + err.message);
        }
    },

    /**
     * Import data from JSON file
     */
    async import(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const count = Storage.importData(ev.target.result);
                
                if (confirm(`Import ${count} folder(s)?`)) {
                    Renderer.folders();
                    Icons.initAll();
                    Renderer.closeShortcuts?.();
                }
            } catch (err) {
                alert("Invalid JSON file: " + err.message);
            }
        };
        reader.onerror = () => alert("Error reading file");
        reader.readAsText(file);
    }
};