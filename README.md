# OpenCode Suspend Guard

防止把 OpenCode 的 `ctrl+x` 误按成 `ctrl+z`。

第一次按 `ctrl+z`，TUI 最底部短暂显示 **ctrl+z again to suspend**。两秒内再次按下才执行原生挂起；其他按键或粘贴会取消确认。`fg` 恢复后需要重新确认。

提示沿用当前主题，只有一行，不推动输入框或对话内容。窄终端使用更短的文案，弹窗打开时也能看见。

## 使用

面向 OpenCode v2，已在 v2.0.24 的 Linux/WSL 环境验证。macOS 使用宿主同一套 POSIX 挂起机制，尚未实测。原生 Windows 没有这个挂起命令，插件保持惰性。

```sh
git clone https://github.com/WhiteGiverMa/opencode-suspend-guard.git
cd opencode-suspend-guard
bun install
bun run build
```

把插件目录加入全局 `cli.json` 的 `plugins`，保留已有插件：

```json
{
  "plugins": ["/absolute/path/opencode-suspend-guard"]
}
```

这是客户端 TUI 插件，不放进服务端 `opencode.json`。重新打开 TUI 后生效，不需要重启 OpenCode 服务。

也可以从 TUI 的插件管理器禁用，或从配置中移除。显式关闭：

```json
{
  "plugins": [
    { "package": "/absolute/path/opencode-suspend-guard", "options": { "enabled": false } }
  ]
}
```

只守卫 `ctrl+z`，不改变其他快捷键。第二次调用宿主的 `terminal.suspend`，不会自行发送信号或修改终端设置。终端报告的自动重复按键会被忽略；旧式终端若不报告按键重复，无法区分按住连发与再次按下。`opencode mini` 不在支持范围内。

## 开发

```sh
bun run typecheck
bun test
bun run build
```

MIT © 2026 WhiteGiverMa
