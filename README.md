# OpenCode Terminal Guard

防止把 OpenCode 的 `ctrl+x` 误按成 `ctrl+c` 或 `ctrl+z`。

第一次按下只在 TUI 最底部显示提示；两秒内再按同一个组合键才执行：

- `ctrl+z`：**ctrl+z again to suspend**，第二次执行原生挂起。`fg` 恢复后需要重新确认。
- `ctrl+c`：只在原生操作会退出 TUI 时显示 **ctrl+c again to exit**，第二次才退出。清草稿、关闭补全、退出 shell 模式和关闭弹窗仍然单按生效，不拦截这些操作。

其他按键、粘贴或超时会取消确认；`ctrl+c` 和 `ctrl+z` 不能互相确认。

提示沿用当前主题，只有一行，不推动输入框或对话内容。窄终端使用更短的文案，弹窗打开时也能看见。

## 使用

面向 OpenCode v2，已在 v2.0.26 的 Linux/WSL 环境验证。macOS 尚未实测。原生 Windows 只守卫 `ctrl+c`，保留 `ctrl+z` 的原生撤销行为；Windows 尚未实测。

```sh
git clone https://github.com/WhiteGiverMa/opencode-terminal-guard.git
cd opencode-terminal-guard
bun install
bun run build
```

把插件目录加入全局 `cli.json` 的 `plugins`，保留已有插件：

```json
{
  "plugins": ["/absolute/path/opencode-terminal-guard"]
}
```

这是客户端 TUI 插件，不放进服务端 `opencode.json`。保存 `cli.json` 后自动热重载，不需要重启 TUI 或 OpenCode 服务。

包名、仓库名与目录名是 `opencode-terminal-guard`；插件 ID 是 `o3p.terminal.guard`，挂起确认命令 ID 是 `o3p.terminal.guard.suspend`。Ctrl+C 只拦截原生 `app.exit`，不新增 Ctrl+C 绑定。插件选择器可用 `-o3p.terminal.guard` 或 `-o3p.terminal.*` 禁用。

也可以从 TUI 的插件管理器禁用，或从配置中移除。显式关闭：

```json
{
  "plugins": [
    { "package": "/absolute/path/opencode-terminal-guard", "options": { "enabled": false } }
  ]
}
```

只守卫 Ctrl+C 退出和 POSIX 上的 Ctrl+Z 挂起，不改变其他快捷键。`ctrl+d`、`<leader>q`、命令面板与 `/exit` 等显式退出路径保持不变。不会自行发送信号或修改终端设置。终端报告的自动重复按键会被忽略；旧式终端若不报告按键重复，无法区分按住连发与再次按下。`opencode mini` 不在支持范围内。

## 开发

```sh
bun run typecheck
bun test
bun run build
```

MIT © 2026 WhiteGiverMa
