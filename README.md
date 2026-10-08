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

## o3p 命名

o3p 新插件采用 `o3p.<domain>.<feature>` 作为运行时 ID：小写、点分层，功能名内的多词用连字符。`domain` 表示功能领域，不按 server/TUI 实现拆分。包名和仓库名仍采用 `opencode-<feature>`。

| 标识 | 本插件 |
| --- | --- |
| npm 包 / 仓库 | `opencode-suspend-guard` |
| 运行时插件 ID | `o3p.terminal.suspend-guard` |
| TUI 命令 ID | `o3p.terminal.suspend-guard.confirm` |

插件 ID 由插件声明，不由包名自动生成。命令 ID 是独立标识；o3p 自有命令约定以前述插件 ID 为前缀，避免冲突。`opencode.*` 留给宿主内置插件，不作为 o3p 的命名空间。

配置仍以包名或目录加载，再按 ID 控制开关。例如禁用已加载的所有 o3p TUI 插件：

```json
{
  "plugins": ["/absolute/path/opencode-suspend-guard", "-o3p.*"]
}
```

只禁用本插件可用 `-o3p.terminal.suspend-guard`；`-o3p.terminal.*` 按领域禁用。配置按顺序处理，通配选择器不会安装插件，TUI 与服务端配置分别生效。

发布后保持 ID 稳定：改名会影响用户的 ID 开关和宿主插件存储命名空间。已有 o3p 插件另行迁移，不连带改包名、CLI/MCP 名称或日志标记。

## 开发

```sh
bun run typecheck
bun test
bun run build
```

MIT © 2026 WhiteGiverMa
