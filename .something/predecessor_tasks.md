{
  "name": "Tetris 3D MVP Implementation",
  "query": "Implement a browser-based 3D Tetris game using Three.js with core gameplay mechanics including piece movement, rotation, line clearing, and scoring in an immersive 3D environment. The implementation must maintain 30+ FPS performance across modern browsers while providing familiar Tetris gameplay with enhanced 3D visuals.",
  "tasks": [
    {
      "id": 1,
      "prerequisite": [],
      "description": "Set up project structure and Three.js development environment",
      "criteria": "Project directory structure is created with HTML, CSS, JS files. Three.js library is integrated via CDN. Basic HTML page loads with Three.js scene initialized. Development server is configured for local testing.",
      "status": "pending"
    },
    {
      "id": 2,
      "prerequisite": [1],
      "description": "Initialize 3D scene with camera, lighting, and basic rendering setup",
      "criteria": "Three.js scene, camera (orthographic), renderer, and lighting are properly configured. Scene renders successfully in browser with WebGL context. Camera is positioned for optimal Tetris gameplay view at (8, 12, 8) looking at (5, 10, 0).",
      "status": "pending"
    },
    {
      "id": 3,
      "prerequisite": [2],
      "description": "Create 3D game board representation and rendering system",
      "criteria": "3D game board with 10×20 grid is rendered using Three.js meshes. Board boundaries are visually distinct. Empty cells are clearly differentiated from filled cells. Board supports collision detection queries for piece placement validation.",
      "status": "pending"
    },
    {
      "id": 4,
      "prerequisite": [2],
      "description": "Implement Tetromino piece definitions and 3D mesh generation",
      "criteria": "All 7 standard Tetris pieces (I, O, T, S, Z, J, L) are defined with correct shapes and colors. Each piece has 3D mesh representation using instanced cube geometry. Piece rotation matrices are correctly implemented for all 4 rotations per piece type.",
      "status": "pending"
    },
    {
      "id": 5,
      "prerequisite": [3, 4],
      "description": "Develop collision detection system for pieces and board boundaries",
      "criteria": "Collision detection accurately prevents pieces from moving outside board boundaries. System detects collisions between falling pieces and placed pieces on the board. Performance is optimized for real-time gameplay (sub-millisecond collision checks).",
      "status": "pending"
    },
    {
      "id": 6,
      "prerequisite": [4, 5],
      "description": "Implement piece movement mechanics (left, right, down, rotate)",
      "criteria": "Arrow keys control piece movement smoothly. Left/Right arrows move piece horizontally. Down arrow accelerates piece fall speed. Up arrow or spacebar rotates piece clockwise. All movements respect collision boundaries and provide immediate visual feedback.",
      "status": "pending"
    },
    {
      "id": 7,
      "prerequisite": [5],
      "description": "Create automatic piece falling system with configurable speed",
      "criteria": "Pieces automatically fall at regular intervals based on game level. Fall speed increases progressively with level advancement. Piece placement is finalized when collision is detected at bottom. New pieces spawn at the top center of the board.",
      "status": "pending"
    },
    {
      "id": 8,
      "prerequisite": [3, 5],
      "description": "Implement line clearing detection and animation system",
      "criteria": "System accurately detects completed horizontal lines across the 10-width board. Completed lines are removed with smooth animation. Pieces above cleared lines fall down to fill gaps. Multiple line clears (double, triple, Tetris) are properly handled.",
      "status": "pending"
    },
    {
      "id": 9,
      "prerequisite": [8],
      "description": "Develop scoring system with level progression mechanics",
      "criteria": "Points awarded for line clears: 100 (single), 300 (double), 500 (triple), 800 (Tetris). Score increases with level multiplier. Level advances every 10 lines cleared. Fall speed increases with each level according to standard Tetris progression.",
      "status": "pending"
    },
    {
      "id": 10,
      "prerequisite": [7],
      "description": "Create next piece preview system and piece spawning logic",
      "criteria": "Next piece is displayed in a separate preview area with 3D representation. Piece sequence is randomly generated following standard Tetris bag randomization. Current piece transitions smoothly to next piece when placed.",
      "status": "pending"
    },
    {
      "id": 11,
      "prerequisite": [6, 7, 8, 9],
      "description": "Implement game state management and core game loop",
      "criteria": "Game loop runs at consistent 60 FPS using requestAnimationFrame. Game states (start, playing, paused, game over) are properly managed. State transitions are smooth with appropriate visual feedback. Game maintains stable performance during extended play sessions.",
      "status": "pending"
    },
    {
      "id": 12,
      "prerequisite": [8],
      "description": "Develop game over detection and handling system",
      "criteria": "Game over is triggered when new pieces cannot be placed due to board height limit. Game over state displays final score and level. Game over screen provides restart functionality. All game systems are properly reset on restart.",
      "status": "pending"
    },
    {
      "id": 13,
      "prerequisite": [11],
      "description": "Create user interface for game controls and status display",
      "criteria": "UI displays current score, level, and lines cleared in real-time. Next piece preview is visible and updates correctly. Start/restart buttons are functional. Controls instructions are displayed. UI is responsive and doesn't interfere with 3D gameplay area.",
      "status": "pending"
    },
    {
      "id": 14,
      "prerequisite": [11],
      "description": "Implement input handling system with keyboard controls",
      "criteria": "Keyboard input is captured and processed correctly. Input buffering prevents missed commands during rapid key presses. Key repeat functionality works for movement keys. Pause functionality is implemented (Enter key). Input system is responsive with minimal latency.",
      "status": "pending"
    },
    {
      "id": 15,
      "prerequisite": [2],
      "description": "Optimize 3D rendering performance with object pooling and efficient mesh management",
      "criteria": "Object pooling system reuses cube meshes for performance. Geometry instancing is implemented for board elements. Memory usage stays under 50MB during gameplay. Frame rate maintains 30+ FPS on target browsers. Mesh creation/destruction is minimized during gameplay.",
      "status": "pending"
    },
    {
      "id": 16,
      "prerequisite": [13, 14],
      "description": "Implement responsive design and basic touch support for mobile devices",
      "criteria": "Game scales appropriately on different screen sizes. Touch controls provide basic movement and rotation functionality. Mobile performance maintains playable frame rates (30+ FPS minimum, 20 FPS absolute minimum). UI elements are accessible on touch devices.",
      "status": "pending"
    },
    {
      "id": 17,
      "prerequisite": [1],
      "description": "Add browser compatibility detection and WebGL support validation",
      "criteria": "WebGL support is detected before game initialization. Graceful error messages display for unsupported browsers. Feature detection prevents crashes on limited hardware. Compatibility tested on Chrome 80+, Firefox 75+, Safari 13+, Edge 80+.",
      "status": "pending"
    },
    {
      "id": 18,
      "prerequisite": [15, 16, 17],
      "description": "Conduct cross-browser testing and performance optimization",
      "criteria": "Game functions correctly across all target browsers. Performance meets requirements (30+ FPS) on mid-range devices. Memory leaks are identified and resolved. Loading time is under 5 seconds on standard connections.",
      "status": "pending"
    },
    {
      "id": 19,
      "prerequisite": [6, 8, 9, 12],
      "description": "Implement comprehensive error handling and recovery systems",
      "criteria": "Game handles WebGL context loss gracefully. Error boundaries prevent complete application crashes. User-friendly error messages are displayed for common issues. Game state is preserved during recoverable errors.",
      "status": "pending"
    },
    {
      "id": 20,
      "prerequisite": [11, 13],
      "description": "Add game analytics and performance monitoring system",
      "criteria": "FPS monitoring tracks real-time performance. Basic gameplay metrics are collected with user consent (session length, lines cleared, high score). Error tracking captures and reports technical issues. Performance data helps identify optimization opportunities. Analytics are optional and anonymized.",
      "status": "pending"
    },
    {
      "id": 21,
      "prerequisite": [14],
      "description": "Implement accessibility features for inclusive gameplay",
      "criteria": "Keyboard-only navigation support is implemented. Screen reader compatibility with game state announcements. High contrast mode for visual accessibility. Focus management for UI elements. Accessibility testing completed with assistive technologies.",
      "status": "pending"
    },
    {
      "id": 22,
      "prerequisite": [2],
      "description": "Implement camera rotation capability and positioning optimization",
      "criteria": "Optional camera rotation around game board (slow, non-disruptive). Camera positioning optimized for gameplay visibility. Camera controls accessible via keyboard. Fixed camera mode available as default. Camera system maintains 30+ FPS performance.",
      "status": "pending"
    },
    {
      "id": 23,
      "prerequisite": [18, 19, 20, 21, 22],
      "description": "Finalize deployment preparation and production build optimization",
      "criteria": "Code is minified and optimized for production. Asset loading is optimized with appropriate caching headers. CDN integration for Three.js library is configured. Static hosting deployment is tested and functional.",
      "status": "pending"
    },
    {
      "id": 24,
      "prerequisite": [23],
      "description": "Create comprehensive documentation and deployment guide",
      "criteria": "README file contains setup and development instructions. Code is documented with clear comments explaining game logic. Deployment guide provides step-by-step hosting instructions. Architecture decisions are documented for future maintenance.",
      "status": "pending"
    }
  ],
  "preferences": [
    {
      "id": 1,
      "criteria": "All code must maintain 30+ FPS performance target across modern browsers",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "Maintain 30+ FPS during active gameplay with smooth animations for piece movement and line clearing",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 2,
      "criteria": "Three.js library should be loaded via CDN for optimal caching and performance",
      "satisfied": false,
      "source": {
        "type": "PREFERENCE",
        "content": "Three.js: CDN delivery (jsDelivr/unpkg) for asset delivery optimization",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 3,
      "criteria": "Game must implement all 7 standard Tetris pieces with accurate rotation mechanics",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "REQ-2: Implement all 7 standard Tetris pieces (I, O, T, S, Z, J, L) with 3D visual representation and accurate piece rotation mechanics",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 4,
      "criteria": "WebGL support must be detected with graceful degradation for unsupported browsers",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "NFR-2: Browser Compatibility - Support for modern browsers with WebGL capabilities with feature detection and graceful degradation",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 5,
      "criteria": "Object pooling should be implemented for optimal memory management and performance",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "Object pooling for frequently created/destroyed elements and efficient data structures for game state tracking",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 6,
      "criteria": "Game board must be exactly 10×20×1 dimensions following standard Tetris specifications",
      "satisfied": false,
      "source": {
        "type": "FACT",
        "content": "REQ-1: Display a 3D Tetris playing field with standard Tetris dimensions (10 width × 20 height × 1 depth for gameplay)",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 7,
      "criteria": "Input handling must provide responsive controls with minimal latency for optimal user experience",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "NFR-3: Responsive input handling with minimal lag and intuitive controls matching traditional Tetris expectations",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 8,
      "criteria": "Scoring system must follow standard Tetris scoring rules with level progression",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "REQ-4: Points awarded for line clears (single, double, triple, Tetris) with level progression and increasing fall speed",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 9,
      "criteria": "Code should be clean, maintainable with modular design for future enhancements",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "NFR-4: Clean, maintainable code structure with modular design for easy future enhancements",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 10,
      "criteria": "Camera must be positioned optimally for gameplay visibility at coordinates (8, 12, 8) looking at (5, 10, 0)",
      "satisfied": false,
      "source": {
        "type": "PREFERENCE",
        "content": "REQ-6: Fixed or slowly rotating camera perspective optimizing gameplay visibility with specified positioning",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 11,
      "criteria": "Accessibility features must be implemented for inclusive gameplay experience",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "Basic accessibility features for keyboard navigation, screen reader support, and high contrast mode",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 12,
      "criteria": "Analytics system should collect optional anonymized usage metrics with user consent",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "Analytics framework for usage tracking - Optional anonymized metrics with user consent",
        "owner_type": "COMPANY"
      }
    },
    {
      "id": 13,
      "criteria": "Mobile performance must maintain 30+ FPS minimum with 20 FPS absolute minimum fallback",
      "satisfied": false,
      "source": {
        "type": "RULE",
        "content": "Mobile device performance targets - 30+ FPS minimum, 20 FPS absolute minimum with adaptive quality settings",
        "owner_type": "COMPANY"
      }
    }
  ]
}