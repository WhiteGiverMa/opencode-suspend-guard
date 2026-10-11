import { Plugin } from "@opencode/plugin/tui"
import type { KeyEvent } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { createSignal, Show } from "solid-js"
import { createConfirmation, type GuardKey } from "./confirmation.ts"

function guardKey(event?: KeyEvent): GuardKey | undefined {
  if (!event?.ctrl || event.shift || event.meta || event.option || event.super || event.hyper) return
  const name = event.name === "c" || event.name === "z"
    ? event.name
    : String.fromCharCode(event.baseCode ?? 0).toLowerCase()
  if (name === "c" || name === "z") return name
}

export default Plugin.define({
  id: "o3p.terminal.guard",
  setup(context) {
    if (context.options.enabled === false) return

    const [pending, setPending] = createSignal<GuardKey>()
    const confirmation = createConfirmation(setPending)
    const nativeExit = context.keymap.commands().find(command => command.id === "app.exit")
    let exitPress: { handled: boolean } | undefined
    const settleExit = () => {
      if (exitPress && !exitPress.handled) confirmation.cancel()
      exitPress = undefined
    }
    const observe = (event: KeyEvent) => {
      settleExit()
      const key = guardKey(event)
      if (key !== pending()) confirmation.cancel()
      if (key === "c") {
        const press = exitPress = { handled: false }
        // A Ctrl+C consumed by another action must not authorize the next exit.
        queueMicrotask(() => { if (exitPress === press) settleExit() })
      }
    }

    context.renderer.keyInput.prependListener("keypress", observe)
    context.renderer.keyInput.prependListener("paste", confirmation.cancel)
    context.keymap.layer(() => ({
      mode: "global",
      priority: 100,
      commands: [
        ...(nativeExit ? [{
          ...nativeExit,
          bind: false as const,
          run: (_input: string | undefined, event?: KeyEvent) => {
            if (guardKey(event) !== "c") return false
            if (exitPress) exitPress.handled = true
            if (confirmation.press("c", event?.repeated === true || event?.eventType === "repeat")) return false
          },
        }] : []),
        ...(process.platform === "win32" ? [] : [{
          id: "o3p.terminal.guard.suspend",
          bind: "ctrl+z",
          run: (_input: string | undefined, event?: KeyEvent) => {
            if (confirmation.press("z", event?.repeated === true || event?.eventType === "repeat")) {
              context.keymap.dispatch("terminal.suspend")
            }
          },
        }]),
      ],
    }))

    const removeHint = context.ui.slot({
      append: "app",
      render() {
        const dimensions = useTerminalDimensions()
        return (
          <Show when={pending()}>
            <box
              position="absolute"
              bottom={0}
              left={1}
              right={1}
              height={1}
              zIndex={4000}
              backgroundColor={context.theme.background.base}
            >
              <text fg={context.theme.text.feedback.warning.base} wrapMode="none">
                <b>ctrl+{pending()}</b>
                {dimensions().width < 28 ? " again" : pending() === "z" ? " again to suspend" : " again to exit"}
                {dimensions().width >= 48 ? "  ·  esc to cancel" : ""}
              </text>
            </box>
          </Show>
        )
      },
    })

    return () => {
      exitPress = undefined
      confirmation.cancel()
      context.renderer.keyInput.off("keypress", observe)
      context.renderer.keyInput.off("paste", confirmation.cancel)
      removeHint()
    }
  },
})
