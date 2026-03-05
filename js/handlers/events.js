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
import { Network, GitHub } from '../utils.js';
import { Storage } from '../storage.js';

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
        this.initShortcutClicks();
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

    initShortcutClicks() {
        this.dom.shortcutsList.onclick = (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                e.preventDefault(); // Empêche d'ouvrir le lien
                e.stopPropagation();
                
                const shortcutEl = editBtn.closest(".shortcut");
                const index = parseInt(shortcutEl.dataset.index);
                const shortcut = state.selectedFolder.shortcuts[index];
                
                if (shortcut) {
                    Modals.openEdit("shortcut", shortcut);
                }
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
        this.dom.speedTestBtn.onclick = (e) => { e.stopPropagation(); Sidebar.toggleMenu('speedTest'); };
        this.dom.gitBtn.onclick = (e) => { e.stopPropagation(); Sidebar.toggleMenu('git'); };
        this.dom.checkerBtn.onclick = (e) => {
            e.stopPropagation();
            Sidebar.toggleMenu('checker');
            this.refreshWebsiteStatus();
        };
        this.dom.readListBtn.onclick = async (e) => {
            e.stopPropagation();
            Sidebar.toggleMenu('readList');
            const data = await Storage.getList('read');
            this.renderGenericList("readListContent", data, 'read');
        };
        this.dom.watchListBtn.onclick = async (e) => {
            e.stopPropagation();
            Sidebar.toggleMenu('watchList');
            const data = await Storage.getList('watch');
            this.renderGenericList("watchListContent", data, 'watch');
        };
        this.dom.ShoppingListBtn.onclick = async (e) => {
            e.stopPropagation();
            Sidebar.toggleMenu('shoppingList');
            const data = await Storage.getList('shop');
            this.renderGenericList("shoppingListContent", data, 'shop');
        };


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

        // start Speed test button
        const startBtn = document.getElementById("startSpeedTestBtn");
        if (startBtn) {
            startBtn.onclick = (e) => {
                e.stopPropagation();
                this.handleSpeedTest(); // On appelle la logique de calcul
            };
        } else {
            console.error("Le bouton startSpeedTestBtn n'a pas été trouvé dans le DOM !");
        }
        
        //Github
        // 1. Gestion de l'ouverture du menu GitHub
        this.dom.gitBtn.onclick = (e) => {
            e.stopPropagation();
            Sidebar.toggleMenu('git');
            
            const currentUser = Storage.getGithubUser();
            if (currentUser) {
                this.loadGitHubData(currentUser);
            }
        };

        // 2. Gestion du bouton de sauvegarde/mise à jour
        const saveGitBtn = document.getElementById("saveGitUserBtn");
        if (saveGitBtn) {
            saveGitBtn.onclick = async (e) => {
                e.stopPropagation();
                const username = this.dom.githubUsernameInput.value.trim();
                if (username) {
                    saveGitBtn.innerText = "Loading...";
                    Storage.saveGithubUser(username);
                    await this.loadGitHubData(username);
                    saveGitBtn.innerText = "Update & Save";
                }
            };
        }

        //Website checker
        const addCheckBtn = document.getElementById("addCheckerBtn");
        if (addCheckBtn) {
            addCheckBtn.onclick = () => {
                const url = document.getElementById("checkerUrlInput").value.trim();
                if (url && url.startsWith('http')) {
                    const sites = Storage.getChecklist();
                    if (!sites.includes(url)) {
                        sites.push(url);
                        Storage.saveChecklist(sites);
                        this.refreshWebsiteStatus();
                        document.getElementById("checkerUrlInput").value = "";
                    }
                }
            };
        }

        // Pour supprimer un site (en utilisant la délégation d'événement)
        this.dom.checkerMenu.onclick = (e) => {
            if (e.target.classList.contains('delete-checker')) {
                const url = e.target.dataset.url;
                const sites = Storage.getChecklist().filter(s => s !== url);
                Storage.saveChecklist(sites);
                this.refreshWebsiteStatus();
            }
        };

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
    },

    initListDeletes() {
        const listMenus = ['readListMenu', 'watchListMenu', 'shoppingListMenu'];
        
        listMenus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (!menu) return;

            menu.onclick = async (e) => {
                if (e.target.classList.contains('delete-item')) {
                    const type = e.target.dataset.type;
                    const index = parseInt(e.target.dataset.index);
                    
                    // On récupère la liste, on retire l'élément, on sauvegarde
                    const currentList = await Storage.getList(type);
                    currentList.splice(index, 1);
                    await Storage.saveList(type, currentList);
                    
                    // On rafraîchit l'affichage
                    this.renderListByType(type);
                }
            };
        });
    },


    async handleSpeedTest() {
    // Récupération des éléments
    const btn = document.getElementById("startSpeedTestBtn");
    const speedDisplay = document.getElementById("speedValue"); // Le 0.00 bleu
    const statusText = document.getElementById("testStatus");   // Le texte "Ready to test"
    const progressBar = document.getElementById("speedProgress");

    if (!btn) return;

    // 1. État de chargement
    btn.disabled = true;
    btn.innerText = "TESTING...";
    statusText.innerText = "Connecting to Cloudflare...";
    if (progressBar) progressBar.style.width = "30%";

    const testFile = "https://speed.cloudflare.com/__down?bytes=5000000"; 
    
    try {
        const speed = await Network.measureDownloadSpeed(testFile);
        
        if (speed) {
            // 2. Mise à jour du GROS chiffre bleu
            let current = 0;
            const target = parseFloat(speed);
            const interval = setInterval(() => {
                current += target / 20; // On monte en 20 étapes
                if (current >= target) {
                    speedDisplay.innerText = target.toFixed(2);
                    clearInterval(interval);
                } else {
                    speedDisplay.innerText = current.toFixed(2);
                }
            }, 30);
            
            // 3. Mise à jour du statut et de la barre
            statusText.innerText = "Test Complete";
            if (progressBar) progressBar.style.width = "100%";
            
            // On laisse la vitesse sur le bouton aussi si tu veux
            btn.innerText = "START TEST"; 
        } else {
            statusText.innerText = "Error: Timeout";
            btn.innerText = "RETRY";
        }
    } catch (error) {
        statusText.innerText = "Connection failed";
        btn.innerText = "RETRY";
    } finally {
        btn.disabled = false;
    }
    },

    async loadGitHubData(username) {
        // On utilise username (le pseudo saisi) ou celui du stockage
        const targetUser = username || Storage.getGithubUser();
        
        if (!targetUser) {
            console.log("Aucun utilisateur GitHub configuré");
            return;
        }

        const repos = await GitHub.fetchRepos(targetUser);
        Renderer.renderGitRepos(repos);
    },

    async refreshWebsiteStatus() {
    const sites = Storage.getChecklist();
    Renderer.renderCheckerList(sites); // Affiche "checking" d'abord

    const statuses = {};
    for (const url of sites) {
        statuses[url] = await Network.checkStatus(url);
    }
    Renderer.renderCheckerList(sites, statuses);
    },

    async renderListByType(type) {
    const data = await Storage.getList(type);
    const containerMap = {
        'read': 'readListContent',
        'watch': 'watchListContent',
        'shop': 'shoppingListContent'
    };
    Renderer.renderGenericList(containerMap[type], data, type);
    },
};