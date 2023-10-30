export function isPresent(input: string | undefined): boolean {
  if (input == null) {
    return false
  }
  if (typeof input === 'string') {
    if (input.trim().length > 0 ) {
      return true
    }
  }
  return false
}

//  StringUtils.isBlank(" ")       = true  
//  StringUtils.isEmpty(" ")       = false  
//  StringUtils.isEmpty("")        = true  

export function isEmpty(input: string | undefined): boolean {
  if (input == null) {
    return true
  }
  if (typeof input === 'string') {
    if (input.length === 0 ) {
      return true
    }
  }
  return false
}

export function isBlank(input: string | undefined): boolean {
  if (input == null) {
    return true
  }
  if (typeof input === 'string') {
    if (input.length >= 0 && input.trim().length === 0 ) {
      return true
    }
  }
  return false
}