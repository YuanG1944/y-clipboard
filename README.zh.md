# Y-CLIP

基于**Tauri 框架**构建的新一代跨平台剪切板增强工具，为效率而生！

> 注：由于本人手头没有linux电脑，当前版本暂不支持 Linux系统（开发中）

<div align="center">
  <div>
      简体中文 | <a href="./README.md">English</a> 
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

## 核心特性

- **全格式支持**  
  纯文本 | 富文本 | HTML | 图片 | 文件
- **隐私至上设计**  
  完全本地存储 | 永不联网 | 数据安全
- **智能收藏夹**  
  收藏高频内容 | 自定义分类管理
- **极速操作流**  
  全局快捷键 | 零鼠标工作流

## 快速安装

### Windows

下载：[x64](https://github.com/YuanG1944/y-clipboard/releases)

### MacOS

下载：[Apple Silicon](https://github.com/YuanG1944/y-clipboard/releases) | [Apple Intel](https://github.com/YuanG1944/y-clipboard/releases)

## 使用指南

### 基础操作

- **`Ctrl/Cmd + Shift + B`**：唤醒剪贴板历史

  ![paste](./mdImage/paste.gif)

- `⬅️ ➡️ 方向键`：**选择粘贴内容** / `⬆️ ⬇️ 方向键`：**切换粘贴格式**

  ![switch](./mdImage/switch.gif)

- **`Enter`**：**粘贴选中内容**
- **`Backspace`**：**删除选中内容**
- **`tab`**: **切换标签**
- **`ctrl/cmd + z`**: **撤销删除**
- **`ctrl/cmd + f`**: **聚焦至搜索框**

- **收藏当前内容**

  ![favorite](./mdImage/favorite.gif)

- **搜索**

  ![search](./mdImage/search.gif)

> **首次使用提示**  
> 请在系统设置中授予剪贴板访问权限：
>
> - macOS: `系统偏好设置 → 安全性与隐私 → 隐私 → 辅助功能`
>
>   <img src="./mdImage/accessibility.png" alt="accessibility" style="zoom:30%;" />
>
> - 如果遇到“文件已损坏“，请执行
>   `sudo xattr -r -d com.apple.quarantine /Applications/y-clip.app`

> **遇到问题？**  
> 欢迎提交至 [Issues 追踪系统](https://github.com/YuanG1944/y-clipboard/issues)  
> _请附上：系统版本/复现步骤/错误截图_

#### 致谢
>[🔗](https://github.com/tauri-apps/tauri) Tauri
>[🔗](https://github.com/ahkohd/tauri-nspanel) tauri-nspanel 
>[🔗](https://github.com/CrossCopy/tauri-plugin-clipboard) tauri-plugin-clipboard 
>[🔗](https://github.com/ChurchTao/clipboard-rs) clipboard-rs 
>[🔗](https://github.com/EcoPasteHub/EcoPaste) Eco-paste