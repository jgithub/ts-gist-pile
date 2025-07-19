export function hasValue(input: any): boolean {
  if (typeof input === 'undefined' || input === null) {
    return false;
  }
  return true;
}

export function isNullish(input: any): boolean {
  if (typeof input === 'undefined' || input === null) {
    return true;
  }
  return false;
}

