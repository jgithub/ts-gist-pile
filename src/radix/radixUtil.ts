const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeNumberAsBase62(num: number): string {
  if (num === 0) return '0';
  if (num < 0) {
    throw new Error(`Cannot encode negative numbers`);
  }

  let result = '';
  while (num > 0) {
    result = BASE62_ALPHABET[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

const BASE62_CHAR_MAP = Object.fromEntries(BASE62_ALPHABET.split('').map((char, i) => [char, i]));

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

/**
 * Converts a hex string (base16) to a base62 string.
 * Works in TypeScript without BigInt or external libraries.
 */
export function convertHexToBase62(hex: string): string {
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error('Invalid hex input');
  }

  let decimal = '0';

  for (let i = 0; i < hex.length; i++) {
    const digit = parseInt(hex[i], 16);
    decimal = multiplyDecimalStringByInt(decimal, 16);
    decimal = addDecimalStrings(decimal, digit.toString());
  }

  if (decimal === '0') return '0';

  let result = '';
  while (decimal !== '0') {
    const { quotient, remainder } = divideDecimalStringByInt(decimal, 62);
    result = BASE62_ALPHABET[parseInt(remainder, 10)] + result;
    decimal = quotient;
  }

  return result;
}

function multiplyDecimalStringByInt(decimal: string, multiplier: number): string {
  let carry = 0;
  let result = '';

  for (let i = decimal.length - 1; i >= 0; i--) {
    const product = parseInt(decimal[i], 10) * multiplier + carry;
    result = (product % 10).toString() + result;
    carry = Math.floor(product / 10);
  }

  if (carry > 0) {
    result = carry.toString() + result;
  }

  return result;
}

function addDecimalStrings(a: string, b: string): string {
  let result = '';
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;

  while (i >= 0 || j >= 0 || carry > 0) {
    const digitA = i >= 0 ? parseInt(a[i--], 10) : 0;
    const digitB = j >= 0 ? parseInt(b[j--], 10) : 0;
    const sum = digitA + digitB + carry;
    result = (sum % 10).toString() + result;
    carry = Math.floor(sum / 10);
  }

  return result;
}

function divideDecimalStringByInt(decimal: string, divisor: number): { quotient: string; remainder: string } {
  let quotient = '';
  let remainder = 0;

  for (let i = 0; i < decimal.length; i++) {
    const digit = parseInt(decimal[i], 10);
    const accumulator = remainder * 10 + digit;
    const q = Math.floor(accumulator / divisor);
    remainder = accumulator % divisor;
    if (quotient !== '' || q > 0) {
      quotient += q.toString();
    }
  }

  return {
    quotient: quotient || '0',
    remainder: remainder.toString(),
  };
}