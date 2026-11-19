// Multibase (https://github.com/multiformats/multibase): a one-character prefix says which base encodes the rest.
// Pure TypeScript over Uint8Array (no Buffer) so it runs in browsers.
// Decoding is strict: each byte string has exactly one spelling per encoding.
import { ArgumentException } from "../exception/ArgumentException";

const BASE64_RFC4648_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const BASE58BTC_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58FLICKR_ALPHABET = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

interface Base64Spec { readonly kind: 'base64'; readonly alphabet: string; readonly padded: boolean }
interface Base58Spec { readonly kind: 'base58'; readonly alphabet: string }

interface EncodingRow {
  readonly codepoint: string;
  readonly prefix: string;
  readonly description: string;
  readonly status: 'final' | 'experimental';
  readonly spec: Base64Spec | Base58Spec;
}

// The one source of truth: the name union, the prefix table and the decoder lookup all derive from this.
// Rows and statuses as in multibase.csv at d7406cdea189b82a0b3937f5737b440f5fa92f92 (spelling "Flicker" is upstream's).
const ENCODINGS = {
  base58btc: { codepoint: 'U+007a', prefix: 'z', description: 'Base58 Bitcoin', status: 'final', spec: { kind: 'base58', alphabet: BASE58BTC_ALPHABET } },
  base58flickr: { codepoint: 'U+005a', prefix: 'Z', description: 'Base58 Flicker', status: 'experimental', spec: { kind: 'base58', alphabet: BASE58FLICKR_ALPHABET } },
  base64: { codepoint: 'U+006d', prefix: 'm', description: 'RFC4648 no padding', status: 'final', spec: { kind: 'base64', alphabet: BASE64_RFC4648_ALPHABET, padded: false } },
  base64pad: { codepoint: 'U+004d', prefix: 'M', description: 'RFC4648 with padding - MIME encoding', status: 'experimental', spec: { kind: 'base64', alphabet: BASE64_RFC4648_ALPHABET, padded: true } },
  base64url: { codepoint: 'U+0075', prefix: 'u', description: 'RFC4648 no padding', status: 'final', spec: { kind: 'base64', alphabet: BASE64URL_ALPHABET, padded: false } },
  base64urlpad: { codepoint: 'U+0055', prefix: 'U', description: 'RFC4648 with padding', status: 'final', spec: { kind: 'base64', alphabet: BASE64URL_ALPHABET, padded: true } },
} as const satisfies Readonly<Record<string, EncodingRow>>;

export type MultibaseName = keyof typeof ENCODINGS;

export interface MultibasePrefixRow {
  readonly codepoint: string;
  readonly prefix: string;
  readonly name: MultibaseName;
  readonly description: string;
  readonly status: 'final' | 'experimental';
}

const NAMES = Object.keys(ENCODINGS) as MultibaseName[];

export const MULTIBASE_PREFIX_TABLE: readonly MultibasePrefixRow[] = NAMES.map((name) => {
  const { codepoint, prefix, description, status } = ENCODINGS[name];
  return { codepoint, prefix, name, description, status };
});

const NAME_BY_PREFIX: ReadonlyMap<string, MultibaseName> = new Map(NAMES.map((name) => [ENCODINGS[name].prefix, name]));
if (NAME_BY_PREFIX.size !== NAMES.length) {
  throw new Error('multibase: two encodings share a prefix');
}

function isMultibaseName(name: string): name is MultibaseName {
  return Object.prototype.hasOwnProperty.call(ENCODINGS, name);
}

export function encode(bytes: Uint8Array, name: MultibaseName): string {
  // Guards JavaScript callers, which the type cannot.
  if (!isMultibaseName(name)) {
    throw new ArgumentException(`multibase: unknown encoding name`);
  }
  const { prefix, spec } = ENCODINGS[name];
  const body = spec.kind === 'base64'
    ? encodeBase64Body(bytes, spec)
    : encodeBase58Body(bytes, spec.alphabet);
  return prefix + body;
}

export function decode(str: string): { name: MultibaseName; bytes: Uint8Array } {
  if (str.length === 0) {
    throw new ArgumentException('multibase: empty string has no prefix');
  }
  const prefix = str[0];
  const name = NAME_BY_PREFIX.get(prefix);
  if (name === undefined) {
    throw new ArgumentException(`multibase: unknown prefix U+${str.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`);
  }
  const { spec } = ENCODINGS[name];
  const bytes = spec.kind === 'base64'
    ? decodeBase64Body(str, spec, prefix)
    : decodeBase58Body(str, spec.alphabet, prefix);
  return { name, bytes };
}

// Positions in error messages are 0-based indexes into the whole string, so the prefix is position 0.
function badChar(prefix: string, position: number, why: string): ArgumentException {
  return new ArgumentException(`multibase '${prefix}': ${why} at position ${position}`);
}

function encodeBase64Body(bytes: Uint8Array, spec: Base64Spec): string {
  const a = spec.alphabet;
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += a[(n >> 18) & 63] + a[(n >> 12) & 63] + a[(n >> 6) & 63] + a[n & 63];
  }
  const rest = bytes.length - i;
  if (rest === 1) {
    const n = bytes[i] << 16;
    out += a[(n >> 18) & 63] + a[(n >> 12) & 63] + (spec.padded ? '==' : '');
  } else if (rest === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += a[(n >> 18) & 63] + a[(n >> 12) & 63] + a[(n >> 6) & 63] + (spec.padded ? '=' : '');
  }
  return out;
}

function decodeBase64Body(str: string, spec: Base64Spec, prefix: string): Uint8Array {
  // str[0] is the prefix; the body starts at index 1.
  let end = str.length;
  if (spec.padded) {
    while (end > 1 && str[end - 1] === '=') {
      end--;
    }
  }
  const padCount = str.length - end;
  const dataLen = end - 1;

  for (let p = 1; p < end; p++) {
    if (spec.alphabet.indexOf(str[p]) === -1) {
      throw badChar(prefix, p, str[p] === '=' ? 'padding where none is allowed' : 'character outside the alphabet');
    }
  }
  if (dataLen % 4 === 1) {
    throw new ArgumentException(`multibase '${prefix}': body length ${dataLen} is not a valid base64 length`);
  }
  if (spec.padded) {
    const expectedPad = (4 - (dataLen % 4)) % 4;
    if (padCount !== expectedPad) {
      throw new ArgumentException(`multibase '${prefix}': expected ${expectedPad} padding characters, found ${padCount}`);
    }
  }

  const out = new Uint8Array(Math.floor((dataLen * 6) / 8));
  let acc = 0;
  let bits = 0;
  let o = 0;
  for (let p = 1; p < end; p++) {
    acc = ((acc << 6) | spec.alphabet.indexOf(str[p])) & 0xffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = (acc >> bits) & 0xff;
    }
  }
  if ((acc & ((1 << bits) - 1)) !== 0) {
    throw badChar(prefix, end - 1, 'non-zero unused trailing bits in the final character');
  }
  return out;
}

function encodeBase58Body(bytes: Uint8Array, alphabet: string): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) {
    zeros++;
  }

  // Base-58 digits, least significant first.
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] * 256;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let out = alphabet[0].repeat(zeros);
  for (let j = digits.length - 1; j >= 0; j--) {
    out += alphabet[digits[j]];
  }
  return out;
}

function decodeBase58Body(str: string, alphabet: string, prefix: string): Uint8Array {
  const values: number[] = [];
  for (let p = 1; p < str.length; p++) {
    const v = alphabet.indexOf(str[p]);
    if (v === -1) {
      throw badChar(prefix, p, 'character outside the alphabet');
    }
    values.push(v);
  }
  let zeros = 0;
  while (zeros < values.length && values[zeros] === 0) {
    zeros++;
  }

  // Bytes, least significant first.
  const bytes: number[] = [];
  for (let i = zeros; i < values.length; i++) {
    let carry = values[i];
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  const out = new Uint8Array(zeros + bytes.length);
  for (let j = 0; j < bytes.length; j++) {
    out[out.length - 1 - j] = bytes[j];
  }
  return out;
}
