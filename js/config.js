/**
 * ArticFox Configuration
 * Contains all constants and static configuration
 */

export const CONFIG = {
    // Available icons for folders
    AVAILABLE_ICONS: [
        "folder", "archive", "music", "image", "video", 
        "file-text", "github", "globe", "terminal", "code", 
        "hash", "layers", "cpu", "database", "message-square",
        "clapperboard", "gamepad-2", "headphones", "camera", "bookmark",
        "clock", "search", "gauge", "book", "settings", "school", "message-circle-more",
        "bot", "shopping-cart", "gamepad", "circuit-board", "cuboid", "library-big",
        "download", "puzzle", "square-library", "boxes", "monitor", "hammer"
    ],
    
    // Search engine URLs
    ENGINES: {
        startpage: "https://www.startpage.com/sp/search?query=",
        google: "https://www.google.com/search?q=",
        bing: "https://www.bing.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
        youtube: "https://www.youtube.com/results?search_query=",
        mojeek: "https://www.mojeek.com/search?q=",
        swisscows: "https://swisscows.com/web?query=",
        archive: "https://archive.org/search.php?query=",
        dogpile: "https://www.dogpile.com/serp?q=",
        gibiru: "https://gibiru.com/results.html?q=",
        brave: "https://search.brave.com/search?q=",
        qwant: "https://www.qwant.com/?q="
    },
    
    // Default values
    DEFAULTS: {
        folderIcon: "folder",
        alignment: "left",
        foldersVisible: true
    },
    
    // Animation timings
    TIMING: {
        modalFade: 300,
        shortcutSwitch: 150,
        debounce: 150,
        suggestionDelay: 150
    }
};

// SVG Icons for search suggestions
export const SEARCH_ICONS = {
    SEARCH: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    CLOCK: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};