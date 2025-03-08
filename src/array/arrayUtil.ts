



export function tryParseStringToArray(input: string | undefined | null): Array<string> {
  if (input == null) {
    return []
  }
  
  input = input.replace(/\[/g, "")
  input = input.replace(/\]/g, "")
  input = input.replace(/\"/g, "")
  input = input.replace(/\'/g, "")

  // common delimiters
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