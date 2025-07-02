



export function tryParseStringToArray(input: string | undefined | null): Array<string> {
  if (input == null) {
    return []
  }
  
  input = input.replace(/\[/g, "")
  input = input.replace(/\]/g, "")
  input = input.replace(/\"/g, "")
  input = input.replace(/\'/g, "")

  // common delimiters
  // TODO:  colon is tricky, let's avoid it for now
  // a:1,b:2.   I might want colon to be a sub-delimiter
  const parts = input.split(/[,;\s\t]/);
  const result: Array<string> = []

  for (let part of parts) {
    if (part.trim().length > 0) {
      const trimmedPart = part.trim()
      if (trimmedPart.length > 0) {
        result.push(trimmedPart)
      }
    }
  }

  return result
}


export function hasExactlyOneItem(input: any[]): boolean {
  if (Array.isArray(input) && input.length == 1) {
    return true
  }
  return false;
}

export function isPopulated(input: any[]): boolean {
  if (Array.isArray(input) && input.length > 0) {
    return true
  }
  return false;
}

export function existsButIsEmpty(input: any[]): boolean {
  if (Array.isArray(input) && input.length === 0) {
    return true
  }
  return false;
}

// export function arrayify(input: any, options: {nullIsAnElement: boolean, undefinedIsAnElement: boolean, emptyStringIsAnElement?: boolean}): Array<any> {
//   if (Array.isArray(input)) {
//     // It's already an array
//     return input
//   }
//   if (typeof input === 'undefined') {
//     if (options?.undefinedIsAnElement === true) {
//       return [undefined]
//     }
//     return []
//   }
//   if (input === null) {
//     if (options?.nullIsAnElement === true) {
//       return [null]
//     }
//     return []
//   }
//   return [input]
// }