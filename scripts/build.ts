import solidPlugin from "@opentui/solid/bun-plugin"

const result = await Bun.build({
  entrypoints: ["./src/tui.tsx"],
  outdir: "./dist",
  target: "node",
  plugins: [solidPlugin],
  external: ["@opencode/plugin/tui", "@opentui/core", "@opentui/solid", "solid-js"],
})

if (!result.success) throw new AggregateError(result.logs, "Plugin build failed")
