import { expect, test } from "bun:test"
import path from "node:path"

test("the local TUI directory has a resolvable conventional entry point", () => {
  const directory = path.resolve(import.meta.dir, "..")
  expect(() => Bun.resolveSync(path.join(directory, "tui"), directory)).not.toThrow()
})
