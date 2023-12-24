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

export function isWellFormedCanonicalUuid(input: string | undefined): boolean {
  if (input == null) {
    return false
  }
  if (typeof input === 'string') {
    const regexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (input.toLowerCase().match(regexp)) {
      return true
    }
  }
  return false
}

export function padLeftWithZeros(input: any, notLessThanXDigits: number): string {
  let workingValue: string = input.toString();
  while (workingValue.length < notLessThanXDigits) {
    workingValue = "0" + workingValue;
  }
  return workingValue;
}