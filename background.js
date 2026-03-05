const LISTS = [
    { id: "read", title: "Add to Reading List" },
    { id: "watch", title: "Add to Watch List" },
    { id: "shop", title: "Add to Shopping List" }
];

// Création du menu au clic droit
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "articfox-parent",
        title: "ArticFox",
        contexts: ["page"]
    });

    LISTS.forEach(list => {
        chrome.contextMenus.create({
            id: list.id,
            parentId: "articfox-parent",
            title: list.title,
            contexts: ["page"]
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const listKey = `articfox_${info.menuItemId}_list`;
    
    chrome.storage.local.get([listKey], (result) => {
        const currentList = result[listKey] || [];
        const newItem = {
            title: tab.title,
            url: tab.url,
            date: new Date().toLocaleDateString()
        };
        
        currentList.push(newItem);
        chrome.storage.local.set({ [listKey]: currentList });
    });
});