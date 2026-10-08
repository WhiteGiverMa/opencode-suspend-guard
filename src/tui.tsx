import { Plugin } from "@opencode/plugin/tui"
import type { KeyEvent } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { createSignal, Show } from "solid-js"
import { createConfirmation } from "./confirmation.ts"

export default Plugin.define({
  id: "o3p.terminal.suspend-guard",
  setup(context) {
    if (context.options.enabled === false || process.platform === "win32") return

    const [visible, setVisible] = createSignal(false)
    const confirmation = createConfirmation(setVisible, () => context.keymap.dispatch("terminal.suspend"))
    const observe = (event: KeyEvent) => {
      if (event.name !== "z" || !event.ctrl || event.shift || event.meta || event.option || event.super || event.hyper) {
        confirmation.cancel()
      }
    }

    context.renderer.keyInput.prependListener("keypress", observe)
    context.renderer.keyInput.prependListener("paste", confirmation.cancel)
    context.keymap.layer(() => ({
      mode: "global",
      priority: 100,
      commands: [{
        id: "o3p.terminal.suspend-guard.confirm",
        bind: "ctrl+z",
        run: (_input, event) => confirmation.press(event?.repeated === true || event?.eventType === "repeat"),
      }],
    }))

    const removeHint = context.ui.slot({
      append: "app",
      render() {
        const dimensions = useTerminalDimensions()
        return (
          <Show when={visible()}>
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
                <b>ctrl+z</b>
                {dimensions().width < 28 ? " again" : " again to suspend"}
                {dimensions().width >= 48 ? "  ·  esc to cancel" : ""}
              </text>
            </box>
          </Show>
        )
      },
    })

    return () => {
      confirmation.cancel()
      context.renderer.keyInput.off("keypress", observe)
      context.renderer.keyInput.off("paste", confirmation.cancel)
      removeHint()
    }
  },
})
