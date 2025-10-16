export function isPresent(input: string | undefined | null): boolean {
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

export function isEmpty(input: string | undefined | null): boolean {
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

export function isBlank(input: string | undefined | null): boolean {
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

export function isWellFormedCanonicalUuid(input: string | undefined | null): boolean {
  if (input == null) {
    return false
  }
  if (typeof input === 'string') {
    // Changed 2025: Updated regex from [0-5] to [0-7] to support UUID v6 and v7
    // UUIDv7 is now commonly used for time-ordered identifiers
    // Format: xxxxxxxx-xxxx-Vxxx-Nxxx-xxxxxxxxxxxx where V = version (0-7), N = variant (8,9,a,b)
    const regexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-7][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
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

export function tryRemoveTrailingSlashesIfPresent(input: string | null | undefined): string| null | undefined {
  if (input == null) {
    return input
  }

  while (input.endsWith("\/")) {
    input = input.replace(/\/$/g, "")
  }
  return input
}


export function tryRemoveDoubleSlashesIfPresent(input: string| null | undefined, opt?: { butTryToBeSmartAboutUrls: boolean }): string| null | undefined {
  if (input == null) {
    return input
  }
  
  while (input.match(/\/\//)) {
    input = input.replace(/\/\//g, "/")
  }

  if (opt?.butTryToBeSmartAboutUrls) {
    input = input.replace(/^https:\//, "https://")
    input = input.replace(/^http:\//, "http://")
    input = input.replace(/^ftp:\//, "ftp://")
  }

  return input
}