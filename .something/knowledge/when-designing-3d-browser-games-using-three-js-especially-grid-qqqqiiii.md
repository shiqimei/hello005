# UUID
29fe3f52-af38-4199-af06-e6004936c8e9

# Trigger
When designing 3D browser games using Three.js, especially grid-based games like Tetris

# Content
## Technical Design Best Practices for 3D Browser Games

### Architecture Patterns
- Use Entity-Component-System (ECS) pattern for game objects
- Implement fixed timestep game loops with RequestAnimationFrame
- Separate rendering pipeline from game logic for better performance
- Use state machines for game flow management (MENU, PLAYING, PAUSED, GAME_OVER)

### Three.js Optimization Strategies
- Instance rendering for repeated geometry (game blocks)
- Object pooling to prevent garbage collection spikes
- Orthographic cameras provide better clarity for grid-based gameplay
- Minimal geometry creation/destruction during active gameplay

### Performance Targets for Browser Games
- Desktop: 60 FPS target, 30 FPS minimum
- Tablet: 45 FPS target, 30 FPS minimum  
- Mobile: 30 FPS target, 20 FPS minimum
- Load time: <5 seconds on standard connections

### Browser Compatibility Strategy
- Target WebGL 1.0 for broader support
- Implement feature detection with graceful degradation
- Support modern browsers: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Handle WebGL context loss with auto-recovery

### Security Considerations
- CSP headers: Allow CDN sources for Three.js but minimize 'unsafe-inline'
- Local storage only for non-sensitive preferences
- Pure client-side applications need no server security measures
- Input validation for all game actions

### Data Model Design
- Use TypeScript interfaces for game state structure
- Efficient 3D arrays for grid-based games (board[x][y][z])
- Separate rendering data from game logic data
- Enum-based state management for clarity

### Error Handling & Recovery
- Global error boundaries for graceful degradation
- WebGL context loss recovery mechanisms
- Performance monitoring with automatic quality adjustment
- User-friendly error messages for technical failures