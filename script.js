/**
 * ARTICFOX EXTENSION - FIXED VERSION
 */
let DOM = {};

// Wait for Lucide to be available
function waitForLucide(callback, maxAttempts = 20) {
    let attempts = 0;
    const checkLucide = setInterval(() => {
        attempts++;
        if (window.lucide && typeof lucide.createIcons === 'function') {
            clearInterval(checkLucide);
            console.log("✓ Lucide loaded successfully");
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkLucide);
            console.error("✗ Lucide failed to load after", attempts, "attempts");
        }
    }, 100);
}

// Initialize Lucide icons properly
function initAllLucideIcons() {
    if (!window.lucide || typeof lucide.createIcons !== 'function') {
        console.error("Lucide not available");
        return;
    }
    
    try {
        // Replace all data-lucide elements with SVG icons
        lucide.createIcons();
        console.log("✓ Lucide icons initialized");
    } catch (e) {
        console.error("Error initializing Lucide:", e);
    }
}

function initLucideForElement(element) {
    if (!window.lucide || typeof lucide.createIcons !== 'function') return;
    
    try {
        lucide.createIcons({
            root: element
        });
    } catch (e) {
        console.error("Error initializing Lucide for element:", e);
    }
}

// Start the main application once Lucide is ready

function initArticFox() {

// --- DOM CACHE ---
DOM = {
    searchSuggestions: document.getElementById("searchSuggestions"),
    searchForm: document.getElementById("searchForm"),
    engineSelect: document.getElementById("engineSelect"),
    searchInput: document.getElementById("searchInput"),
    iconPicker: document.getElementById("iconPicker"),
    editIconPicker: document.getElementById("editIconPicker"),
    selectedFolderIcon: document.getElementById("selectedFolderIcon"),
    editSelectedIcon: document.getElementById("editSelectedIcon"),
    foldersContainer: document.getElementById("foldersContainer"),
    foldersRow: document.getElementById("folders"),
    toggleBtn: document.getElementById("toggleFolders"),
    toggleIcon: document.getElementById("toggleIcon"),
    addFolderBtn: document.getElementById("addFolder"),
    shortcutsContainer: document.getElementById("shortcutsContainer"),
    shortcutsList: document.querySelector(".shortcuts-list"),
    folderModal: document.getElementById("folderModal"),
    shortcutModal: document.getElementById("shortcutModal"),
    editModal: document.getElementById("editModal"),
    folderNameInput: document.getElementById("folderName"),
    shortcutNameInput: document.getElementById("shortcutName"),
    shortcutLinkInput: document.getElementById("shortcutLink"),
    shortcutIconInput: document.getElementById("shortcutIcon"),
    editName: document.getElementById("editName"),
    editLink: document.getElementById("editLink"),
    editLinkLabel: document.getElementById("editLinkLabel"),
    editIcon: document.getElementById("editIcon"),
    editFolderIconSection: document.getElementById("editFolderIconSection"),
    editSelectedIconInput: document.getElementById("editSelectedIcon"),
    settingsBtn: document.getElementById("settingsBtn"),
    settingsMenu: document.getElementById("settingsMenu"),
    dataBtn: document.getElementById("dataBtn"),
    dataMenu: document.getElementById("dataMenu"),
    BgBtn: document.getElementById("BgBtn"),
    BgMenu: document.getElementById("BgMenu"),
    alignBtn: document.getElementById("alignBtn"),
    alignMenu: document.getElementById("alignMenu"),
    bgInput: document.getElementById("bgInput"),
    iconSearch: document.getElementById("iconSearch"),
    editIconSearch: document.getElementById("editIconSearch"),
    editShortcutSection: document.getElementById("editShortcutSection")
};

//test
if (DOM.toggleFolders) {
    DOM.toggleFolders.addEventListener("click", toggleFoldersVisibility);
}

// --- DATA & STATE ---
const AVAILABLE_ICONS = [
    "folder", "archive", "music", "image", "video", 
    "file-text", "github", "globe", "terminal", "code", 
    "hash", "layers", "cpu", "database", "message-square",
    "clapperboard", "gamepad-2", "headphones", "camera", "bookmark",
    "clock", "search", "gauge", "book", "settings"
];

let foldersData = JSON.parse(localStorage.getItem("foldersData")) || [];
let selectedFolderId = null;
let currentEdit = { type: null, obj: null };
let foldersAlign = localStorage.getItem("foldersAlign") || "left";

// --- UTILS ---
const saveData = () => localStorage.setItem("foldersData", JSON.stringify(foldersData));
const saveAlign = () => localStorage.setItem("foldersAlign", foldersAlign);
const getFavicon = (url) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch (e) { 
        return ""; 
    }
};

function resetFolderModal() {
    DOM.folderNameInput.value = "";
    const defaultIcon = "folder";
    DOM.selectedFolderIcon.value = defaultIcon;
    
    DOM.iconPicker.querySelectorAll(".icon-option").forEach(el => {
        el.classList.toggle("selected", el.dataset.icon === defaultIcon);
    });

    const previewDiv = document.getElementById("iconPreview");
    if (previewDiv) {
        previewDiv.innerHTML = `<i data-lucide="${defaultIcon}"></i>`;
        initAllLucideIcons();
    }
}

function toggleFoldersVisibility() {
    // 1. Basculer la visibilité
    const isHidden = DOM.foldersContainer.classList.toggle("hidden");
    
    // 2. Sauvegarder l'état
    localStorage.setItem("foldersVisible", !isHidden);
    
    // 3. Changer l'icône dynamiquement
    const iconName = isHidden ? "folder" : "folder-open";
    DOM.toggleFolders.innerHTML = `<i data-lucide="${iconName}"></i>`;
    
    // 4. IMPORTANT : Demander à Lucide de transformer le <i> en SVG tout de suite
    if (window.lucide) {
        lucide.createIcons({
            root: DOM.toggleFolders
        });
    }
}

function resetShortcutModal() {
    DOM.shortcutNameInput.value = "";
    DOM.shortcutLinkInput.value = "";
    DOM.shortcutIconInput.value = "";
}

function closeShortcuts() {
    if (DOM.shortcutsContainer.classList.contains("hidden")) return;
    
    DOM.shortcutsContainer.classList.add("animate-out");
    DOM.shortcutsContainer.classList.remove("animate-in");
    
    setTimeout(() => {
        DOM.shortcutsContainer.classList.add("hidden");
        DOM.shortcutsContainer.classList.remove("animate-out");
        selectedFolderId = null;
    }, 200);
}

// --- RENDER ICON PICKERS ---
function renderIconPicker(container, hiddenInput, selectedIcon) {
    const fragment = document.createDocumentFragment();
    container.innerHTML = "";
    
    AVAILABLE_ICONS.forEach(iconName => {
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

        const previewId = (container.id === "iconPicker") ? "iconPreview" : "editIconPreview";
        const previewDiv = document.getElementById(previewId);
        
        if (previewDiv) {
            previewDiv.innerHTML = `<i data-lucide="${iconName}"></i>`;
            initAllLucideIcons();
        }
    };
    
    initAllLucideIcons();
}

// --- POSITIONING ---
function positionShortcuts() {
    if (!selectedFolderId || DOM.shortcutsContainer.classList.contains("hidden")) return;
    const folderEl = DOM.foldersRow.querySelector(`[data-id="${selectedFolderId}"]`);
    if (!folderEl) return;
    const rect = folderEl.getBoundingClientRect();
    const listWidth = DOM.shortcutsList.offsetWidth;
    const padding = 20;
    DOM.shortcutsContainer.style.top = `${rect.bottom + window.scrollY + 10}px`;
    let leftPos = rect.left;
    if (leftPos + listWidth > window.innerWidth - padding) {
        leftPos = window.innerWidth - listWidth - padding;
    }
    DOM.shortcutsContainer.style.left = `${Math.max(padding, leftPos)}px`;
}

// --- RENDER FOLDERS ---
function renderFolders() {
    const fragment = document.createDocumentFragment();
    DOM.foldersRow.innerHTML = "";
    foldersData.forEach(folder => {
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
    fragment.appendChild(DOM.addFolderBtn);
    DOM.foldersRow.appendChild(fragment);
    applyFoldersAlign(foldersAlign);
    initAllLucideIcons();
}

function renderShortcuts(folder) {
    if (!folder) return;
    
    DOM.shortcutsList.innerHTML = "";
    DOM.shortcutsList.style.opacity = "0";

    const fragment = document.createDocumentFragment();
    
    folder.shortcuts.forEach((shortcut, index) => {
        const a = document.createElement("a");
        a.className = "shortcut";
        a.href = shortcut.link || "#";
        a.target = "_blank";
        a.dataset.index = index;
        a.draggable = true;
        
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

    const addBtn = document.createElement("div");
    addBtn.className = "shortcut placeholder";
    addBtn.innerHTML = `<i data-lucide="plus" style="width:24px; height:24px;"></i>`; 
    addBtn.onclick = (e) => {
        e.stopPropagation();
        DOM.shortcutModal.classList.remove("hidden");
    };
    fragment.appendChild(addBtn);

    DOM.shortcutsList.appendChild(fragment);
    
    const columns = Math.min(folder.shortcuts.length + 1, 7);
    DOM.shortcutsList.style.gridTemplateColumns = `repeat(${columns}, 80px)`;
    
    initAllLucideIcons();

    requestAnimationFrame(() => {
        DOM.shortcutsList.style.opacity = "1";
    });

    setTimeout(positionShortcuts, 0);
}

// --- FOLDER ALIGNMENT ---
function applyFoldersAlign(align) {
    const folders = DOM.foldersRow;
    if (!folders) return;

    const firstChild = folders.firstElementChild;
    const lastChild = folders.lastElementChild;

    if (firstChild) firstChild.style.marginLeft = "0";
    if (lastChild) lastChild.style.marginRight = "0";

    if (align === "left") {
        if (lastChild) lastChild.style.marginRight = "auto";
    } else if (align === "right") {
        if (firstChild) firstChild.style.marginLeft = "auto";
    } else {
        if (firstChild) firstChild.style.marginLeft = "auto";
        if (lastChild) lastChild.style.marginRight = "auto";
    }
}

function openEditModal(type, obj) {
    currentEdit = { type, obj };
    DOM.editName.value = obj.name;
    const isFolder = type === "folder";

    if (DOM.editFolderIconSection) DOM.editFolderIconSection.classList.toggle("hidden", !isFolder);
    if (DOM.editShortcutSection) DOM.editShortcutSection.classList.toggle("hidden", isFolder);

    if (isFolder) {
        const currentIcon = obj.icon || "folder";
        DOM.editSelectedIconInput.value = currentIcon;
        
        renderIconPicker(DOM.editIconPicker, DOM.editSelectedIconInput, currentIcon);
        
        const previewDiv = document.getElementById("editIconPreview");
        if (previewDiv) {
            previewDiv.innerHTML = `<i data-lucide="${currentIcon}"></i>`;
            initAllLucideIcons();
        }
    } else {
        if (DOM.editLink) DOM.editLink.value = obj.link || "";
    }

    DOM.editModal.classList.remove("hidden");
}

// --- EVENT HANDLERS ---
DOM.addFolderBtn.onclick = (e) => {
    e.stopPropagation();
    DOM.shortcutsContainer.classList.add("hidden");
    resetFolderModal();
    DOM.folderModal.classList.remove("hidden");
};

DOM.searchForm.onsubmit = e => {
    e.preventDefault();
    const query = DOM.searchInput.value.trim();
    const engineBaseUrl = DOM.engineSelect.value;
    
    if (query) {
        window.location.href = engineBaseUrl + encodeURIComponent(query);
    }
};

DOM.foldersRow.onclick = e => {
    e.stopPropagation(); 
    const folderEl = e.target.closest(".folder");
    if (!folderEl || folderEl.id === "addFolder") return;

    const id = folderEl.dataset.id;
    const folder = foldersData.find(f => f.id === id);

    if (e.target.dataset.action === "edit-folder") {
        openEditModal("folder", folder);
    } else {
        if (selectedFolderId === id) {
            closeShortcuts();
        } else {
            selectedFolderId = id;
            DOM.shortcutsContainer.classList.remove("hidden");
            DOM.shortcutsContainer.classList.remove("animate-out");
            DOM.shortcutsContainer.classList.add("animate-in");
            renderShortcuts(folder);
        }
    }
};

DOM.shortcutsList.onclick = e => {
    const editBtn = e.target.closest('[data-action="edit-shortcut"]');
    if (editBtn) {
        e.preventDefault(); 
        e.stopPropagation();
        const shortcutIdx = editBtn.closest(".shortcut").dataset.index;
        const folder = foldersData.find(f => f.id === selectedFolderId);
        openEditModal("shortcut", folder.shortcuts[shortcutIdx]);
    }
};

DOM.foldersRow.ondragstart = e => e.dataTransfer.setData("text/plain", e.target.dataset.id);
DOM.foldersRow.ondragover = e => e.preventDefault();
DOM.foldersRow.ondrop = e => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const targetFolder = e.target.closest(".folder");
    if (!targetFolder || targetFolder.id === "addFolder" || draggedId === targetFolder.dataset.id) return;
    const draggedIdx = foldersData.findIndex(f => f.id === draggedId);
    const targetIdx = foldersData.findIndex(f => f.id === targetFolder.dataset.id);
    const [moved] = foldersData.splice(draggedIdx, 1);
    foldersData.splice(targetIdx, 0, moved);
    saveData(); 
    renderFolders();
};

DOM.toggleBtn.onclick = () => {
    const isHidden = DOM.foldersContainer.classList.toggle("hidden");
    localStorage.setItem("foldersVisible", !isHidden);
    
    const icon = document.getElementById("toggleIcon");
    if (icon) {
        icon.setAttribute("data-lucide", isHidden ? "folder" : "folder-open");
        initAllLucideIcons();
    }
};

DOM.settingsBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = !DOM.settingsMenu.classList.toggle("hidden");
    DOM.settingsBtn.classList.toggle("active", isVisible);
};

DOM.dataBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = !DOM.dataMenu.classList.toggle("hidden");
    DOM.dataBtn.classList.toggle("active", isVisible);
};

DOM.BgBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = !DOM.BgMenu.classList.toggle("hidden");
    DOM.BgBtn.classList.toggle("active", isVisible);
};


DOM.alignBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = !DOM.alignMenu.classList.toggle("hidden");
    DOM.alignBtn.classList.toggle("active", isVisible);
};

DOM.iconSearch.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const icons = DOM.iconPicker.querySelectorAll(".icon-option");
    
    icons.forEach(icon => {
        const name = icon.dataset.icon.toLowerCase();
        icon.style.display = name.includes(term) ? "flex" : "none";
    });
});

if (DOM.editIconSearch) {
    DOM.editIconSearch.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const icons = DOM.editIconPicker.querySelectorAll(".icon-option");
        
        icons.forEach(icon => {
            const name = icon.dataset.icon.toLowerCase();
            icon.style.display = name.includes(term) ? "flex" : "none";
        });
    });
}

document.onclick = (e) => {
    if (!DOM.settingsMenu.contains(e.target) && e.target !== DOM.settingsBtn) {
        DOM.settingsMenu.classList.add("hidden");
        DOM.settingsBtn.classList.remove("active");
    }
};

document.onclick = (e) => {
    if (!DOM.dataMenu.contains(e.target) && e.target !== DOM.dataBtn) {
        DOM.dataMenu.classList.add("hidden");
        DOM.dataBtn.classList.remove("active");
    }
};

document.onclick = (e) => {
    if (!DOM.BgMenu.contains(e.target) && e.target !== DOM.BgBtn) {
        DOM.BgMenu.classList.add("hidden");
        DOM.BgBtn.classList.remove("active");
    }
};

document.onclick = (e) => {
    if (!DOM.alignMenu.contains(e.target) && e.target !== DOM.alignBtn) {
        DOM.alignMenu.classList.add("hidden");
        DOM.alignBtn.classList.remove("active");
    }
};

DOM.settingsMenu.querySelectorAll(".align-option").forEach(opt => {
    opt.onclick = (e) => {
        e.stopPropagation();
        foldersAlign = opt.dataset.align; 
        saveAlign(); 
        applyFoldersAlign(foldersAlign);
        setTimeout(positionShortcuts, 50);
        DOM.settingsMenu.classList.add("hidden");
    };
});

DOM.alignMenu.querySelectorAll(".align-option").forEach(opt => {
    opt.onclick = (e) => {
        e.stopPropagation();
        foldersAlign = opt.dataset.align; 
        saveAlign(); 
        applyFoldersAlign(foldersAlign);
        setTimeout(positionShortcuts, 50);
        DOM.alignMenu.classList.add("hidden");
    };
});

DOM.bgInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        document.body.style.backgroundImage = `url(${ev.target.result})`;
        localStorage.setItem("customBg", ev.target.result);
    };
    reader.readAsDataURL(file);
};

document.getElementById("saveEdit").onclick = () => {
    const newName = DOM.editName.value.trim();
    if (!newName) return alert("Name is required");
    if (currentEdit.type === "folder") {
        currentEdit.obj.name = newName;
        currentEdit.obj.icon = DOM.editSelectedIconInput.value;
        saveData(); 
        renderFolders();
        DOM.editModal.classList.add("hidden");
    } else {
        currentEdit.obj.name = newName;
        const newLink = DOM.editLink.value.trim();
        currentEdit.obj.link = newLink || currentEdit.obj.link;
        const updateAndClose = () => {
            saveData();
            renderShortcuts(foldersData.find(f => f.id === selectedFolderId));
            DOM.editModal.classList.add("hidden");
        };
        if (DOM.editIcon.files[0]) {
            const reader = new FileReader();
            reader.onload = e => { 
                currentEdit.obj.icon = e.target.result; 
                updateAndClose(); 
            };
            reader.readAsDataURL(DOM.editIcon.files[0]);
        } else { 
            currentEdit.obj.icon = getFavicon(currentEdit.obj.link); 
            updateAndClose(); 
        }
    }
};

document.getElementById("deleteEdit").onclick = () => {
    if (currentEdit.type === "folder") {
        foldersData = foldersData.filter(f => f.id !== currentEdit.obj.id);
        if (selectedFolderId === currentEdit.obj.id) { 
            DOM.shortcutsContainer.classList.add("hidden"); 
            selectedFolderId = null; 
        }
        renderFolders();
    } else {
        const folder = foldersData.find(f => f.id === selectedFolderId);
        folder.shortcuts = folder.shortcuts.filter(s => s !== currentEdit.obj);
        renderShortcuts(folder);
    }
    saveData(); 
    DOM.editModal.classList.add("hidden");
};

document.getElementById("createFolder").onclick = () => {
    const name = DOM.folderNameInput.value.trim();
    if (!name) return alert("Name required");
    foldersData.push({ 
        id: Date.now().toString(), 
        name, 
        icon: DOM.selectedFolderIcon.value, 
        shortcuts: [] 
    });
    saveData(); 
    renderFolders();
    DOM.folderModal.classList.add("hidden");
};

document.getElementById("createShortcut").onclick = () => {
    const name = DOM.shortcutNameInput.value.trim();
    const link = DOM.shortcutLinkInput.value.trim();
    const folder = foldersData.find(f => f.id === selectedFolderId);
    if (!name || !folder) return alert("Name and folder required");
    const newShortcut = { name, link: link || "#", icon: getFavicon(link) };
    const file = DOM.shortcutIconInput.files[0];
    const finish = () => {
        folder.shortcuts.push(newShortcut); 
        saveData();
        renderShortcuts(folder); 
        DOM.shortcutModal.classList.add("hidden");
        resetShortcutModal();
    };
    if (file) {
        const reader = new FileReader();
        reader.onload = e => { 
            newShortcut.icon = e.target.result; 
            finish(); 
        };
        reader.readAsDataURL(file);
    } else {
        finish();
    }
};

document.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.onclick = () => btn.closest(".modal").classList.add("hidden");
});

document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify(foldersData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); 
    a.href = url; 
    a.download = "articfox_backup.json"; 
    a.click();
};

document.getElementById("importBtn").onclick = () => document.getElementById("importInput").click();
document.getElementById("importInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result);
            if (Array.isArray(data) && confirm("Overwrite current data?")) { 
                foldersData = data; 
                saveData(); 
                renderFolders(); 
            }
        } catch (err) { 
            alert("Invalid file"); 
        }
    };
    reader.readAsText(file);
};

// --- CLICK OUTSIDE TO CLOSE ---
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add("hidden");
    }

    const isFolder = e.target.closest('.folder');
    const isShortcuts = e.target.closest('#shortcutsContainer');
    const isModal = e.target.closest('.modal-content');
    const isSettings = e.target.closest('#settingsMenu') || e.target === DOM.settingsBtn;
    const isAlign = e.target.closest('#alignMenu') || e.target === DOM.alignBtn;
    const isBg = e.target.closest('#BgMenu') || e.target === DOM.BgBtn;
    const isData = e.target.closest('#dataMenu') || e.target === DOM.dataBtn;

    if (!isFolder && !isShortcuts && !isModal) {
        closeShortcuts();
    }

    if (!isSettings) {
        DOM.settingsMenu.classList.add("hidden");
        DOM.settingsBtn.classList.remove("active");
    }

    if (!isBg) {
        DOM.BgMenu.classList.add("hidden");
        DOM.BgBtn.classList.remove("active");
    }

    if (!isAlign) {
        DOM.alignMenu.classList.add("hidden");
        DOM.alignBtn.classList.remove("active");
    }

    if (!isData) {
        DOM.dataMenu.classList.add("hidden");
        DOM.dataBtn.classList.remove("active");
    }
};

window.onkeydown = (e) => {
    if (e.key === "Escape") {
        closeShortcuts();
        document.querySelectorAll('.modal').forEach(m => m.classList.add("hidden"));
        DOM.settingsMenu.classList.add("hidden");
    }
};

window.onkeydown = (e) => {
    if (e.key === "Escape") {
        closeShortcuts();
        document.querySelectorAll('.modal').forEach(m => m.classList.add("hidden"));
        DOM.dataMenu.classList.add("hidden");
    }
};

window.onkeydown = (e) => {
    if (e.key === "Escape") {
        closeShortcuts();
        document.querySelectorAll('.modal').forEach(m => m.classList.add("hidden"));
        DOM.BgMenu.classList.add("hidden");
    }
};

window.onkeydown = (e) => {
    if (e.key === "Escape") {
        closeShortcuts();
        document.querySelectorAll('.modal').forEach(m => m.classList.add("hidden"));
        DOM.alignMenu.classList.add("hidden");
    }
};

// --- DRAG & DROP SHORTCUTS ---
DOM.shortcutsList.ondragstart = e => {
    const shortcutEl = e.target.closest(".shortcut");
    if (!shortcutEl || shortcutEl.classList.contains("placeholder")) return;
    e.dataTransfer.setData("shortcutIndex", shortcutEl.dataset.index);
};

DOM.shortcutsList.ondragover = e => e.preventDefault();

DOM.shortcutsList.ondrop = e => {
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData("shortcutIndex"));
    const targetShortcut = e.target.closest(".shortcut");
    
    if (!targetShortcut || targetShortcut.classList.contains("placeholder")) return;
    
    const targetIdx = parseInt(targetShortcut.dataset.index);
    if (draggedIdx === targetIdx) return;

    const folder = foldersData.find(f => f.id === selectedFolderId);
    if (!folder) return;

    const [movedShortcut] = folder.shortcuts.splice(draggedIdx, 1);
    folder.shortcuts.splice(targetIdx, 0, movedShortcut);

    saveData();
    renderShortcuts(folder);
};

// --- SEARCH CONFIGURATION ---
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
let debounceTimer;
let selectedIndex = -1;

function saveSearch(query) {
    if (!query) return;
    searchHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function fetchGoogleSuggestions(query) {
    return new Promise((resolve) => {
        const callbackName = 'googleCallback_' + Math.floor(Math.random() * 100000);
        
        window[callbackName] = (data) => {
            delete window[callbackName];
            const scriptTag = document.getElementById(callbackName);
            if (scriptTag) scriptTag.remove();
            
            const cleanData = data[1].map(item => {
                if (Array.isArray(item)) return item[0];
                if (typeof item === 'string') return item.split(',')[0];
                return item;
            });
            
            resolve(cleanData);
        };

        const script = document.createElement('script');
        script.id = callbackName;
        script.src = `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodeURIComponent(query)}&callback=${callbackName}`;
        
        script.onerror = () => {
            delete window[callbackName];
            resolve([]);
        };

        document.body.appendChild(script);
    });
}

const ICON_SEARCH = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const ICON_CLOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

async function showSuggestions(val) {
    const query = val.toLowerCase().trim();
    const wrapper = document.querySelector('.search-wrapper');

    if (query === "") {
        hideSearchSuggestions();
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const googleSuggRaw = await fetchGoogleSuggestions(query);
        
        const localSugg = searchHistory
            .filter(item => item.toLowerCase().includes(query) && !googleSuggRaw.includes(item))
            .map(text => ({ text: text, type: 'history' }));

        const googleSugg = googleSuggRaw.map(text => ({ text: text, type: 'google' }));
        const allSuggestions = [...localSugg, ...googleSugg].slice(0, 8);

        DOM.searchSuggestions.innerHTML = "";
        
        if (allSuggestions.length > 0) {
            allSuggestions.forEach((sugg, index) => {
                const div = document.createElement("div");
                div.className = "suggestion-item";
                div.innerHTML = `
                    <span class="suggestion-icon">${sugg.type === 'history' ? ICON_CLOCK : ICON_SEARCH}</span>
                    <span class="suggestion-text">${sugg.text}</span>
                `;
                div.onclick = () => {
                    DOM.searchInput.value = sugg.text;
                    saveSearch(sugg.text);
                    DOM.searchForm.dispatchEvent(new Event('submit'));
                    hideSearchSuggestions();
                };
                DOM.searchSuggestions.appendChild(div);
            });
            
            DOM.searchSuggestions.classList.remove("hidden");
            if (wrapper) wrapper.classList.add("active");
        } else {
            hideSearchSuggestions();
        }
    }, 150);
}

function hideSearchSuggestions() {
    DOM.searchSuggestions.classList.add("hidden");
    DOM.searchSuggestions.innerHTML = "";
    selectedIndex = -1;
    
    const wrapper = document.querySelector('.search-wrapper');
    if (wrapper) {
        wrapper.classList.remove("active");
    }
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) {
        hideSearchSuggestions();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        hideSearchSuggestions();
    }
});

DOM.searchInput.oninput = (e) => showSuggestions(e.target.value);

DOM.searchInput.onkeydown = (e) => {
    const items = DOM.searchSuggestions.querySelectorAll(".suggestion-item");
    
    if (DOM.searchSuggestions.classList.contains("hidden") || items.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelectedSuggestion(items);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelectedSuggestion(items);
    } else if (e.key === "Enter" && selectedIndex > -1) {
        e.preventDefault();
        const selectedText = items[selectedIndex].querySelector(".suggestion-text").innerText;
        
        DOM.searchInput.value = selectedText;
        saveSearch(selectedText);
        DOM.searchForm.dispatchEvent(new Event('submit'));
    }
};

function updateSelectedSuggestion(items) {
    items.forEach((item, idx) => {
        item.classList.toggle("selected", idx === selectedIndex);
    });
}

// --- INITIALIZATION ---
const savedBg = localStorage.getItem("customBg");
if (savedBg) document.body.style.backgroundImage = `url(${savedBg})`;

const isVisible = JSON.parse(localStorage.getItem("foldersVisible")) !== false;
DOM.foldersContainer.classList.toggle("hidden", !isVisible);

renderIconPicker(DOM.iconPicker, DOM.selectedFolderIcon, "folder");
renderFolders();
applyFoldersAlign(foldersAlign);

window.addEventListener("resize", positionShortcuts);

} // End of initArticFox

waitForLucide(() => {
    // 1. On initialise d'abord les références DOM et les événements
    initArticFox(); 
    
    // 2. On initialise les icônes de base
    initAllLucideIcons();
    
    // 3. Initialisation du background
    const savedBg = localStorage.getItem("customBg");
    if (savedBg) document.body.style.backgroundImage = `url(${savedBg})`;

    // 4. Initialisation de la visibilité des dossiers (Sécurisée)
    const isVisible = JSON.parse(localStorage.getItem("foldersVisible")) !== false;
    
    if (DOM.foldersContainer) {
        DOM.foldersContainer.classList.toggle("hidden", !isVisible);
    }
    
    // 5. Mise à jour de l'icône du bouton au démarrage
    const toggleBtn = document.getElementById("toggleFolders");
    if (toggleBtn) {
        toggleBtn.innerHTML = `<i data-lucide="${isVisible ? 'folder-open' : 'folder'}"></i>`;
        // On demande à Lucide de générer l'icône immédiatement
        if (window.lucide) {
            lucide.createIcons({ root: toggleBtn });
        }
    }

    // 6. Rendu du picker d'icônes
    if (DOM.iconPicker) {
        renderIconPicker(DOM.iconPicker, DOM.selectedFolderIcon, "folder");
    }
});
