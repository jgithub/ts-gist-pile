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


const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeNumberAsBase62(num: number): string {
  if (num === 0) return '0';
  if (num < 0) {
    throw new Error(`Cannot encode negative numbers`);
  }

  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

const BASE62_CHAR_MAP = Object.fromEntries(BASE62_CHARS.split('').map((char, i) => [char, i]));

export function decodeBase62ToNumber(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE62_CHAR_MAP[char];
    if (typeof value === 'undefined') {
      throw new Error(`Invalid base62 character: ${char}`);
    }
    result = result * 62 + value;
  }
  return result;
}