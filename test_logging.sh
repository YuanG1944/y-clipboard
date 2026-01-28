#!/bin/bash

# 日志测试脚本
# 使用方法: bash test_logging.sh

echo "🔍 Y-Clipboard 日志系统测试"
echo "=============================="
echo ""

# 检查 Cargo.toml 中是否包含 log 和 env_logger
echo "📦 检查依赖..."
if grep -q 'log = "0.4' src-tauri/Cargo.toml && grep -q 'env_logger = "0.11' src-tauri/Cargo.toml; then
    echo "✅ 日志库依赖已正确添加"
else
    echo "❌ 日志库依赖缺失"
    exit 1
fi

echo ""
echo "📝 检查日志初始化..."

# 检查 lib.rs 中的日志初始化
if grep -q 'env_logger::Builder::from_default_env()' src-tauri/src/lib.rs; then
    echo "✅ lib.rs 日志初始化已配置"
else
    echo "❌ lib.rs 日志初始化缺失"
    exit 1
fi

echo ""
echo "🔍 检查关键模块中的日志记录..."

# 检查 clipboard_monitor 中的日志
modules=("src-tauri/src/clipboard_monitor/monitor.rs" "src-tauri/src/clipboard_monitor/plugin.rs" "src-tauri/src/db/database.rs")

for module in "${modules[@]}"; do
    if [ -f "$module" ]; then
        if grep -q 'use log::{' "$module" || grep -q 'info!' "$module" || grep -q 'error!' "$module"; then
            echo "✅ $(basename $module) 中已添加日志"
        else
            echo "⚠️  $(basename $module) 中的日志可能不完整"
        fi
    fi
done

echo ""
echo "📚 检查文档..."
if [ -f "LOG_SETUP.md" ]; then
    echo "✅ LOG_SETUP.md 文档已创建"
else
    echo "❌ LOG_SETUP.md 文档缺失"
fi

if [ -f "LOGGING_CHANGES.md" ]; then
    echo "✅ LOGGING_CHANGES.md 文档已创建"
else
    echo "❌ LOGGING_CHANGES.md 文档缺失"
fi

echo ""
echo "=============================="
echo "✨ 日志系统验证完成！"
echo ""
echo "📖 下一步：查看 LOG_SETUP.md 了解如何使用日志系统"
echo ""
echo "快速开始："
echo "  RUST_LOG=info cargo tauri dev"
echo ""
