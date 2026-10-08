export function createConfirmation(show: (visible: boolean) => void, suspend: () => void) {
  let deadline = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancel = () => {
    clearTimeout(timer)
    timer = undefined
    deadline = 0
    show(false)
  }

  return {
    cancel,
    press(repeated = false) {
      if (repeated) return
      const confirmed = deadline > performance.now()
      cancel()
      if (confirmed) {
        suspend()
        return
      }
      deadline = performance.now() + 2000
      show(true)
      timer = setTimeout(cancel, 2000)
    },
  }
}
