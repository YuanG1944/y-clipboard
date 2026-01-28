# 日志系统实现总结

## 添加的内容

### 1. 依赖库
在 `src-tauri/Cargo.toml` 中添加了：
- `log = "0.4.22"` - 日志门面库
- `env_logger = "0.11"` - 环境变量驱动的日志实现

### 2. 修改的文件

#### [src-tauri/src/lib.rs](src-tauri/src/lib.rs)
- 导入 `log` 宏
- 在 `run()` 函数开始处初始化 `env_logger`
- 配置日志级别为 INFO，启用时间戳（毫秒）
- 记录应用启动信息

#### [src-tauri/src/clipboard_monitor/monitor.rs](src-tauri/src/clipboard_monitor/monitor.rs)
- 导入 `log` 宏（info, warn, error）
- `item_collect()` 方法：
  - 添加对每个格式收集的日志记录
  - 添加错误处理日志
  - 替换 `println!()` 为 `log!()` 调用
- `on_clipboard_change()` 方法：
  - 记录剪切板变化事件
  - 记录成功保存的项目
  - 记录数据库插入错误
- `on_clipboard_error()` 方法：
  - 记录错误信息
  - 记录监听器停止事件

#### [src-tauri/src/clipboard_monitor/plugin.rs](src-tauri/src/clipboard_monitor/plugin.rs)
- 导入 `log` 宏
- `start_monitor()` 方法：
  - 记录监听器启动状态
  - 记录启动成功或失败
- `start_monitor_setup()` 方法：
  - 记录设置完成
- `stop_monitor()` 方法：
  - 记录停止事件
- `stop_monitor_exit()` 方法：
  - 记录应用退出时的停止信息
- `is_monitor_running()` 方法：
  - 记录查询状态
- `init()` 方法：
  - 记录插件初始化过程

#### [src-tauri/src/db/database.rs](src-tauri/src/db/database.rs)
- 导入 `log` 宏
- `init()` 方法：
  - 记录数据库路径
  - 记录表创建状态
  - 记录默认标签创建
- `insert_item()` 方法：
  - 记录成功插入
  - 记录插入失败
- `insert_item_distinct()` 方法：
  - 记录空项目跳过
  - 记录重复项检测和处理
  - 记录新项目插入
- `update_pasted_create_time()` 方法：
  - 记录更新成功
  - 记录更新失败
- `update_pasted_active()` 方法：
  - 记录格式更新
  - 记录更新失败

### 3. 新增文档
创建了 [LOG_SETUP.md](LOG_SETUP.md) 文件，详细说明：
- 日志级别定义
- 不同平台的日志查看方法
- 日志过滤和配置
- 故障排查指南

## 关键改进

### 1. 错误可见性
- 所有错误操作都被正确记录，而不是被 `let _` 吞掉
- 可以快速定位问题所在

### 2. 调试便利性
- 通过 `RUST_LOG` 环境变量轻松控制日志级别
- 支持按模块过滤日志

### 3. 生产环境友好
- 使用标准的日志库，便于集成到日志系统
- 结构化日志便于分析

### 4. 时间戳支持
- 所有日志都包含毫秒级时间戳
- 便于性能分析

## 使用示例

### 开发环境运行（查看所有 INFO 级别日志）
```bash
RUST_LOG=info cargo tauri dev
```

### 调试模式（查看 DEBUG 级别日志）
```bash
RUST_LOG=debug cargo tauri dev
```

### 只查看错误
```bash
RUST_LOG=error cargo tauri dev
```

### 只查看特定模块
```bash
RUST_LOG=y_clip::clipboard_monitor=debug cargo tauri dev
```

## 日志覆盖范围

✅ 应用启动和初始化  
✅ 数据库操作  
✅ 剪切板监听和内容收集  
✅ 错误处理  
✅ 监听器状态管理  
✅ 数据去重处理  

## 后续可选优化

1. **文件输出**：集成 `fern` 或 `tracing` 库支持日志写入文件
2. **异步日志**：使用 `tokio-logger` 提高高负载性能
3. **链路追踪**：集成 `tracing` 库支持分布式链路追踪
4. **日志分割**：支持日志按大小或时间分割

## 问题排查指南

现在，当遇到"剪切内容无法保存"的问题时，可以：

1. 启用日志: `RUST_LOG=info cargo tauri dev`
2. 执行复制操作
3. 查看日志输出，特别是是否有 ERROR 或 WARN 信息
4. 根据日志信息定位问题

例如，如果看到 "Failed to save clipboard item" 错误，就说明数据库操作失败，需要进一步检查数据库连接或权限问题。
