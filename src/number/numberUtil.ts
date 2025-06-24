export function tryAsNumber( input: string | number | null | undefined ): undefined | number | null {
  if (typeof input == 'number') {
    return input
  }
  else if (typeof input == 'undefined') {
    return undefined
  }
  else if (input == null) {
    return null
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

/**
 * Converts the input into a number if it can.  Otherwise, throws an error.
 * 
 * @param input 
 * @returns 
 */

export function ensureNumber( input: string | number ): number {
  if (typeof input == 'number') {
    return input
  }
  else if (typeof input == 'string') {
    const workingInput = input.trim()
    if (workingInput.length > 0 && 
        !isNaN(workingInput as unknown as number)) {
      try {
        return parseFloat(input)
      } catch (err) {
        throw err
      }
    }
  }
  throw new Error(`Not a number`)
}


