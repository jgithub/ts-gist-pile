export function tryAsNumber( input: unknown ): undefined | number {
  if (typeof input == 'number') {
    return input
  }
  else if (input == null) {
    return undefined
  }
  else if (typeof input == 'string') {
    const workingInput = input.trim()
    if (workingInput.length > 0 && 
        !isNaN(workingInput as unknown as number)) {
      try {
        return parseFloat(input)
      } catch(err) {
      }
    }
  } 
  return undefined
}