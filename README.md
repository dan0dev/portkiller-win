# PortKiller for Windows

A modern, feature-rich port management tool for Windows built with Tauri 2.0, React, TypeScript, and Tailwind CSS.

## Features

- **Port Scanning**: Real-time scanning of all listening ports using `netstat`
- **Process Management**: Kill processes directly from the UI
- **Favorites & Watch List**: Save frequently used ports and get notifications
- **Process Type Detection**: Automatic categorization (Web, Database, Dev, System, Other)
- **Multiple Views**: List view and Tree view for different browsing preferences
- **System Tray**: Minimize to tray with quick actions
- **Auto-refresh**: Configurable refresh intervals
- **Keyboard Shortcuts**: Ctrl+R (refresh), Ctrl+K (search), Delete (kill selected)
- **Windows Notifications**: Get alerts when watched ports start/stop
- **Launch at Startup**: Optional autostart with Windows

## Prerequisites

1. **Node.js** (v18 or later)
   - Download from: https://nodejs.org/

2. **Rust** (latest stable)
   - Install via rustup: https://rustup.rs/
   - Run: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Or download the Windows installer from the website

3. **Microsoft Visual Studio C++ Build Tools**
   - Required for compiling native Windows code
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++" workload

4. **WebView2** (usually pre-installed on Windows 10/11)
   - If not installed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Installation

```bash
# Clone or navigate to the project directory
cd portkiller-win

# Install Node.js dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Development

```bash
# Start development server (frontend only)
npm run dev

# Type checking
npx tsc --noEmit

# Build frontend only
npm run build
```

## Project Structure

```
portkiller-win/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Entry point
│   │   ├── lib.rs       # App setup & tray
│   │   ├── commands/    # Tauri commands (ports, process)
│   │   └── utils/       # Netstat parsing
│   └── icons/           # App icons
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand state management
│   └── types/           # TypeScript definitions
└── dist/                # Built frontend assets
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+R | Refresh ports |
| Ctrl+K | Focus search |
| Ctrl+, | Open settings |
| Delete | Kill selected process |
| Escape | Close panel/modal |

## Build Output

After running `npm run tauri build`, installers will be available in:
- `src-tauri/target/release/bundle/msi/` - MSI installer
- `src-tauri/target/release/bundle/nsis/` - NSIS installer

## License

MIT
