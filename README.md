<div align="center">
  <img src="src-tauri/icons/Square310x310Logo.png" alt="Take a Break Logo" width="120" height="120">
  <h1>Take a Break</h1>
  <p>A beautiful, distraction-free break reminder app built with Tauri, React, and TypeScript. Designed to help you maintain healthy work habits by taking regular breaks.</p>
</div>


## Current Features

- **Customizable Timer**: Set break durations from 1 to 480 minutes
- **Break Messages**: Add personalized messages for your break reminders
- **Beautiful UI**: Clean, modern interface with smooth animations
- **Session Management**: Start, pause, and resume break sessions
- **Cross-platform**: Works on both Intel and Apple Silicon Macs and Windows, Linux support coming son
- **Responsive Design**: Optimized for desktop use

## Roadmap

- [x] **Customizable Timer**: Set break durations from 1 to 480 minutes
- [x] **Break Messages**: Add personalized messages for break reminders
- [x] **Beautiful UI**: Clean, modern interface with smooth animations
- [x] **Real-time Sync**: Frontend and backend timer synchronization
- [x] **Session Management**: Start, pause, and resume break sessions
- [x] **Cross-platform**: Works on both Intel and Apple Silicon Macs
- [x] **Responsive Design**: Optimized for desktop use
- [ ] **App Blockers**: Block distracting applications during work sessions
- [ ] **Website Blockers**: Block specific websites and domains
- [ ] **System Tray Timer**: Show countdown timer in macOS system tray
- [ ] **Menu Bar Integration**: Quick access to timer controls from menu bar
- [ ] **Schedule Management**: Set up recurring break schedules
- [ ] **Notification Center**: Rich notifications with break reminders
- [ ] **Sound Customization**: Custom break reminder sounds
- [ ] **Custom Themes**: Multiple UI themes and color schemes
- [ ] **Keyboard Shortcuts**: Global hotkeys for quick timer control
- [ ] **Session History**: Track all your break sessions

## Development

### Prerequisites

- [Bun](https://bun.sh/) - Package manager and runtime
- [Rust](https://rustup.rs/) - For Tauri backend
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites#tauri-cli)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run in development mode:
   ```bash
   bun run tauri dev
   ```

### Building

Build for your current platform:
```bash
bun run tauri build
```

Build for specific targets:
```bash
# Intel Mac
bun run tauri build --target x86_64-apple-darwin

# Apple Silicon Mac
bun run tauri build --target aarch64-apple-darwin
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Bug Reports**: Found a bug? Please open an issue with detailed steps to reproduce
2. **Feature Requests**: Have an idea? Open an issue with the "enhancement" label
3. **Code Contributions**: Fork the repo, create a feature branch, and submit a PR
4. **Documentation**: Help improve our documentation and examples

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation for any API changes
- Ensure builds pass for both Intel and Apple Silicon Macs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/) for native performance
- UI components from [Mantine](https://mantine.dev/)
- Icons from [Tabler Icons](https://tabler-icons.io/)
- Fonts: [Baloo 2](https://fonts.google.com/specimen/Baloo+2) and [Kode Mono](https://fonts.google.com/specimen/Kode+Mono)

