export const tryFn = <T>(fn: () => T): T | undefined => {
  try {
    return fn()
  } catch (e) {
    return undefined
  }
}