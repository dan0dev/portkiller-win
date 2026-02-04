# PortKiller for Windows

A Windows port of [Port Killer](https://github.com/jamiepine/port-killer) by [@jamiepine](https://github.com/jamiepine), originally built for macOS.

This version has been rebuilt for Windows using Tauri 2.0, React, TypeScript, and Tailwind CSS.

## Download

**[Download Latest Release](https://github.com/dan0dev/portkiller-win/releases/latest)**

| Installer | Description |
|-----------|-------------|
| [PortKiller_1.0.0_x64-setup.exe](https://github.com/dan0dev/portkiller-win/releases/download/v1.0.0/PortKiller_1.0.0_x64-setup.exe) | NSIS Installer (recommended) |
| [PortKiller_1.0.0_x64_en-US.msi](https://github.com/dan0dev/portkiller-win/releases/download/v1.0.0/PortKiller_1.0.0_x64_en-US.msi) | MSI Installer |

**Requirements:** Windows 10/11 with WebView2 Runtime (pre-installed on most systems)

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

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+R | Refresh ports |
| Ctrl+K | Focus search |
| Ctrl+, | Open settings |
| Delete | Kill selected process |
| Escape | Close panel/modal |

## Building from Source

### Prerequisites

1. **Node.js** (v18 or later) - https://nodejs.org/
2. **Rust** (latest stable) - https://rustup.rs/
3. **Microsoft Visual Studio C++ Build Tools** - https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++" workload
4. **WebView2** (usually pre-installed on Windows 10/11)

### Build Instructions

```bash
# Clone the repository
git clone https://github.com/dan0dev/portkiller-win.git
cd portkiller-win

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

Installers will be generated in:
- `src-tauri/target/release/bundle/msi/` - MSI installer
- `src-tauri/target/release/bundle/nsis/` - NSIS installer

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

## Credits

This project is a Windows port of [Port Killer](https://github.com/jamiepine/port-killer) by [Jamie Pine](https://github.com/jamiepine). The original macOS version inspired this Windows adaptation.

## License

MIT
