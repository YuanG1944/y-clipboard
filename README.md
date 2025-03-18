# Y-CLIP

A next-generation **cross-platform clipboard enhancement tool** built on the **Tauri framework**, designed for efficiency!

> Note: Linux support is currently under development as I don't have a Linux device for testing.

<div align="center">
  <div>
      English | <a href="./README.zh.md">简体中文</a> 
  </div>
  <br/>
</div>

<div align="center">
  <div>
    <a href="https://github.com/YuanG1944/y-clipboard/releases">
      <img
        alt="Windows"
        src="https://img.shields.io/badge/-Windows-blue?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB0PSIxNzI2MzA1OTcxMDA2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1NDgiIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4Ij48cGF0aCBkPSJNNTI3LjI3NTU1MTYxIDk2Ljk3MTAzMDEzdjM3My45OTIxMDY2N2g0OTQuNTEzNjE5NzVWMTUuMDI2NzU3NTN6TTUyNy4yNzU1NTE2MSA5MjguMzIzNTA4MTVsNDk0LjUxMzYxOTc1IDgwLjUyMDI4MDQ5di00NTUuNjc3NDcxNjFoLTQ5NC41MTM2MTk3NXpNNC42NzA0NTEzNiA0NzAuODMzNjgyOTdINDIyLjY3Njg1OTI1VjExMC41NjM2ODE5N2wtNDE4LjAwNjQwNzg5IDY5LjI1Nzc5NzUzek00LjY3MDQ1MTM2IDg0Ni43Njc1OTcwM0w0MjIuNjc2ODU5MjUgOTE0Ljg2MDMxMDEzVjU1My4xNjYzMTcwM0g0LjY3MDQ1MTM2eiIgcC1pZD0iMTU0OSIgZmlsbD0iI2ZmZmZmZiI+PC9wYXRoPjwvc3ZnPg=="
      />
    </a >
    <a href="https://github.com/YuanG1944/y-clipboard/releases">
      <img
        alt="MacOS"
        src="https://img.shields.io/badge/-MacOS-black?style=flat-square&logo=apple&logoColor=white"
      />
    </a >
  </div>
  <a href="./LICENSE">
    <img
      src="https://img.shields.io/github/license/EcoPasteHub/EcoPaste?style=flat-square"
    />
  </a >
</div>

## Features

- **Supports All Formats**  
  Plain text | Rich text | HTML | Images | Files
- **Privacy-First Design**  
  Fully local storage | No internet connection | Secure data
- **Smart Favorites**  
  Save frequently used content | Organize with custom categories
- **Lightning-Fast Workflow**  
  Global hotkeys | Mouse-free operation

## Installation

### Windows

Manual download：[x64](https://github.com/YuanG1944/y-clipboard/releases/tag/windows)

### MacOS

Manual download：[Apple Silicon](https://github.com/YuanG1944/y-clipboard/releases/tag/macos)

## How to Use

### Basic Operations

- **`Ctrl/Cmd + Shift + B`**：Open clipboard history

  ![paste](./mdImage/paste.gif)

- `⬅️ ➡️ Arrow keys`：Select clipboard content / `⬆️ ⬇️ Arrow keys`：Switch paste format

  ![switch](./mdImage/switch.gif)

- **`Enter`**：Paste the selected content
- **`Backspace`**：Delete the selected content
- **`tab`**: Switch lab
- **`ctrl/cmd + z`**: Undo the delete action
- **`ctrl/cmd + f`**: Focus on search input

- **Save current content to Favorites**

  ![favorite](./mdImage/favorite.gif)

- **Search clipboard history**

  ![search](./mdImage/search.gif)

> **First-Time Use Reminder**  
> Please grant clipboard access permission in your system settings:
>
> - macOS: System Preferences → Security & Privacy → Privacy → Accessibility
>
>   <img src="./mdImage/accessibility.png" alt="accessibility" style="zoom:30%;" />
>
> - If you see a “file is damaged” error, run
>   `xattr -c /Applications/y-clip.app`

> **Encountered an issue?**  
> Report it on the [Issues](https://github.com/YuanG1944/y-clipboard/issues)  
> _Please include: OS version, steps to reproduce, and error screenshots._
