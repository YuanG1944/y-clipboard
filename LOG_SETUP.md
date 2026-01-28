# 日志系统设置指南

## 概述
该项目现已集成完整的日志系统，使用 `log` 和 `env_logger` 库。所有关键操作（数据库、剪切板监听、错误处理）都会记录详细的日志信息。

## 日志级别

- **INFO**: 记录应用启动、功能运行等正常信息
- **WARN**: 记录警告信息，如重复项、配置文件已存在等
- **ERROR**: 记录错误信息，如数据库操作失败、读取剪切板失败等

## 如何查看日志

### 1. **macOS 用户**

#### 方法一：使用环境变量运行（开发模式）
```bash
RUST_LOG=info cargo tauri dev
```

#### 方法二：从 Console.app 查看日志
1. 打开 macOS 的 Console.app（应用程序 → 工具 → 控制台）
2. 在搜索栏输入 "y-clip" 或应用名称
3. 实时查看应用日志

### 2. **Windows 用户**

#### 方法一：开发模式运行
```bash
set RUST_LOG=info && cargo tauri dev
```

#### 方法二：使用日志查看工具
- Windows 事件查看器中查找应用日志
- 或使用第三方日志查看工具

### 3. **Linux 用户**

#### 使用环境变量运行
```bash
RUST_LOG=info cargo tauri dev
```

#### 查看系统日志
```bash
journalctl -f | grep y-clip
```

## 日志过滤

### 只查看 ERROR 级别
```bash
RUST_LOG=error cargo tauri dev
```

### 查看特定模块的日志
```bash
# 只查看数据库相关日志
RUST_LOG=y_clip::db=debug cargo tauri dev

# 只查看剪切板监听相关日志
RUST_LOG=y_clip::clipboard_monitor=debug cargo tauri dev
```

### 查看所有日志（包括 DEBUG）
```bash
RUST_LOG=debug cargo tauri dev
```

## 记录的日志位置

### 应用启动
- 应用启动时记录初始化信息
- 数据库初始化状态
- 各个插件的初始化状态

### 剪切板操作
- 剪切板内容变化检测
- 不同格式的内容收集（文本、HTML、图片等）
- 内容保存状态

### 数据库操作
- 数据库表创建
- 记录插入/更新/查询
- 重复项检测

### 错误处理
- 文件读取失败
- 数据库操作失败
- 其他运行时错误

## 典型日志输出示例

```
2025-01-28 14:30:45.123 INFO y_clip: Y-Clipboard application started
2025-01-28 14:30:45.234 INFO y_clip::db: Initializing database at: /Users/user/.config/y-clipboard/y-clipboard.db
2025-01-28 14:30:45.345 INFO y_clip::db: Created history_info table
2025-01-28 14:30:45.456 INFO y_clip::clipboard_monitor::plugin: Initializing clipboard plugin
2025-01-28 14:30:45.567 INFO y_clip::clipboard_monitor::plugin: Auto-starting clipboard monitor
2025-01-28 14:30:45.678 INFO y_clip::clipboard_monitor::monitor: Clipboard content changed
2025-01-28 14:30:45.789 INFO y_clip::clipboard_monitor::monitor: Text format collected
2025-01-28 14:30:45.890 INFO y_clip::db: Successfully inserted clipboard item with id: 550e8400-e29b-41d4-a716-446655440000
```

## 生产环境建议

1. **日志级别**：使用 INFO 或 WARN 级别
2. **性能**：避免过高的日志级别（DEBUG）以减少开销
3. **存储**：如需持久化日志，可配置日志文件输出

## 故障排查

如果遇到以下问题，查看日志可以快速定位原因：

- **剪切内容无法保存**：查看 "Failed to save clipboard item" 错误日志
- **应用启动异常**：查看初始化日志中的 ERROR 信息
- **特定格式无法读取**：查看 "Failed to read" 相关日志
- **数据库错误**：查看数据库相关的 ERROR 日志

## 扩展配置

### 自定义日志格式

如需修改日志输出格式，编辑 [src-tauri/src/lib.rs](src-tauri/src/lib.rs) 中的日志初始化代码：

```rust
env_logger::Builder::from_default_env()
    .filter_level(log::LevelFilter::Info)
    .format_timestamp_millis()  // 添加时间戳（毫秒）
    .try_init()
    .ok();
```

### 添加文件日志（可选）

如需将日志同时输出到文件，可以使用 `fern` 库或其他日志框架进行扩展。
