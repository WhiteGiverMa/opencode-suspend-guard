import { expect, test } from "bun:test"
import { createConfirmation, type GuardKey } from "../src/confirmation.ts"

function fixture() {
  let pending: GuardKey | undefined
  let suspensions = 0
  const confirmation = createConfirmation((value) => { pending = value })
  return {
    confirmation,
    press: (repeated = false) => { if (confirmation.press("z", repeated)) suspensions++ },
    visible: () => pending !== undefined,
    suspensions: () => suspensions,
    [Symbol.dispose]: confirmation.cancel,
  }
}

test.each(["c", "z"] as const)("first Ctrl+%s shows a hint; the second confirms once and clears it", (key) => {
  let pending: GuardKey | undefined
  const confirmation = createConfirmation((value) => { pending = value })
  try {
    expect(confirmation.press(key)).toBe(false)
    expect(pending).toBe(key)
    expect(confirmation.press(key)).toBe(true)
    expect(pending).toBeUndefined()
    expect(confirmation.press(key)).toBe(false)
    expect(pending).toBe(key)
  } finally {
    confirmation.cancel()
  }
})

test("cancellation starts a fresh confirmation, and is safe more than once", () => {
  using setup = fixture()
  setup.press()
  setup.confirmation.cancel()
  setup.confirmation.cancel()
  expect(setup.visible()).toBe(false)
  setup.press()
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
})

test("reported key repeats neither arm nor confirm", () => {
  using setup = fixture()
  setup.press(true)
  expect(setup.visible()).toBe(false)
  setup.press()
  setup.press(true)
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
  setup.press()
  expect(setup.suspensions()).toBe(1)
})

test("the hint expires and a later press cannot reuse the confirmation", async () => {
  using setup = fixture()
  setup.press()
  await Bun.sleep(2100)
  expect(setup.visible()).toBe(false)
  setup.press()
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
})

test("an expired deadline is rejected even when the timer callback could not run", () => {
  using setup = fixture()
  setup.press()
  const end = performance.now() + 2050
  while (performance.now() < end) { /* Deliberately block the event loop, like a stopped process. */ }
  setup.press()
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
})

test("switching guarded keys cancels the previous confirmation instead of authorizing either action", () => {
  let pending: GuardKey | undefined
  const confirmation = createConfirmation((value) => { pending = value })
  try {
    expect(confirmation.press("z")).toBe(false)
    expect(confirmation.press("c")).toBe(false)
    expect(pending).toBe("c")
    expect(confirmation.press("z")).toBe(false)
    expect(pending).toBe("z")
    expect(confirmation.press("z")).toBe(true)
    expect(pending).toBeUndefined()
  } finally {
    confirmation.cancel()
  }
})
