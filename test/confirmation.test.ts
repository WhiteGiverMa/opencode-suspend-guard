import { expect, test } from "bun:test"
import { createConfirmation } from "../src/confirmation.ts"

function fixture() {
  let visible = false
  let suspensions = 0
  const confirmation = createConfirmation(
    (value) => { visible = value },
    () => { suspensions++ },
  )
  return {
    confirmation,
    visible: () => visible,
    suspensions: () => suspensions,
    [Symbol.dispose]: confirmation.cancel,
  }
}

test("first press shows a hint; the second confirms once and clears it before suspending", () => {
  let visible = false
  let suspensions = 0
  const confirmation = createConfirmation(
    (value) => { visible = value },
    () => {
      expect(visible).toBe(false)
      suspensions++
    },
  )
  try {
    confirmation.press()
    expect(visible).toBe(true)
    expect(suspensions).toBe(0)
    confirmation.press()
    expect(suspensions).toBe(1)
    confirmation.press()
    expect(visible).toBe(true)
    expect(suspensions).toBe(1)
  } finally {
    confirmation.cancel()
  }
})

test("cancellation starts a fresh confirmation, and is safe more than once", () => {
  using setup = fixture()
  setup.confirmation.press()
  setup.confirmation.cancel()
  setup.confirmation.cancel()
  expect(setup.visible()).toBe(false)
  setup.confirmation.press()
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
})

test("reported key repeats neither arm nor confirm", () => {
  using setup = fixture()
  setup.confirmation.press(true)
  expect(setup.visible()).toBe(false)
  setup.confirmation.press()
  setup.confirmation.press(true)
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
  setup.confirmation.press()
  expect(setup.suspensions()).toBe(1)
})

test("the hint expires and a later press cannot reuse the confirmation", async () => {
  using setup = fixture()
  setup.confirmation.press()
  await Bun.sleep(2100)
  expect(setup.visible()).toBe(false)
  setup.confirmation.press()
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
})

test("an expired deadline is rejected even when the timer callback could not run", () => {
  using setup = fixture()
  setup.confirmation.press()
  const end = performance.now() + 2050
  while (performance.now() < end) { /* Deliberately block the event loop, like a stopped process. */ }
  setup.confirmation.press()
  expect(setup.visible()).toBe(true)
  expect(setup.suspensions()).toBe(0)
})
