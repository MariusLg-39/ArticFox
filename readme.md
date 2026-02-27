articfox/
├── manifest.json          # Extension manifest (if needed)
├── index.html             # Main entry point (cleaned)
├── css/
│   ├── main.css           # CSS variables & base styles
│   ├── components.css     # UI components (folders, shortcuts, modals)
│   ├── sidebar.css        # Right sidebar styles
│   └── search.css         # Search bar & suggestions
├── js/
│   ├── app.js             # Main initialization
│   ├── config.js          # Constants & configuration
│   ├── state.js           # State management
│   ├── storage.js         # LocalStorage operations
│   ├── utils.js           # Utility functions
│   ├── ui/
│   │   ├── renderer.js    # DOM rendering (folders, shortcuts)
│   │   ├── modals.js      # Modal management
│   │   ├── search.js      # Search functionality
│   │   ├── sidebar.js     # Sidebar menus
│   │   └── icons.js       # Lucide icon management
│   └── handlers/
│       ├── dragdrop.js    # Drag & drop logic
│       ├── events.js      # Global event listeners
│       └── importexport.js # Data import/export