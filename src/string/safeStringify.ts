export const safeStringify = (obj: any, indent = 0) => {
  let cache: any = []
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === 'object' && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  )
  cache = null
  return retVal
}
