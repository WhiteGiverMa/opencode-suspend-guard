export type GuardKey = "c" | "z"

export function createConfirmation(show: (key: GuardKey | undefined) => void) {
  let pending: GuardKey | undefined
  let deadline = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancel = () => {
    clearTimeout(timer)
    timer = undefined
    pending = undefined
    deadline = 0
    show(undefined)
  }

  return {
    cancel,
    press(key: GuardKey, repeated = false) {
      if (repeated) return false
      const confirmed = pending === key && deadline > performance.now()
      cancel()
      if (confirmed) return true
      pending = key
      deadline = performance.now() + 2000
      show(key)
      timer = setTimeout(cancel, 2000)
      return false
    },
  }
}
