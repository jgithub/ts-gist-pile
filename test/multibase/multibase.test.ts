import { expect } from 'chai';
import { multibase } from "../../src/index";
import { MultibaseName } from "../../src/multibase/multibase";

// Official vectors: https://github.com/multiformats/multibase, tests/basic.csv, leading_zero.csv and
// two_leading_zeros.csv at commit d7406cdea189b82a0b3937f5737b440f5fa92f92. Only the six supported encodings are used.
const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);
const YES_MANI = utf8('yes mani !');
const ONE_ZERO = new Uint8Array([0].concat(Array.from(YES_MANI)));
const TWO_ZEROS = new Uint8Array([0, 0].concat(Array.from(YES_MANI)));

const VECTORS: Array<[string, Uint8Array, MultibaseName, string]> = [
  ['basic.csv', YES_MANI, 'base58flickr', 'Z7Pznk19XTTzBtx'],
  ['basic.csv', YES_MANI, 'base58btc', 'z7paNL19xttacUY'],
  ['basic.csv', YES_MANI, 'base64', 'meWVzIG1hbmkgIQ'],
  ['basic.csv', YES_MANI, 'base64pad', 'MeWVzIG1hbmkgIQ=='],
  ['basic.csv', YES_MANI, 'base64url', 'ueWVzIG1hbmkgIQ'],
  ['basic.csv', YES_MANI, 'base64urlpad', 'UeWVzIG1hbmkgIQ=='],
  ['leading_zero.csv', ONE_ZERO, 'base58flickr', 'Z17Pznk19XTTzBtx'],
  ['leading_zero.csv', ONE_ZERO, 'base58btc', 'z17paNL19xttacUY'],
  ['leading_zero.csv', ONE_ZERO, 'base64', 'mAHllcyBtYW5pICE'],
  ['leading_zero.csv', ONE_ZERO, 'base64pad', 'MAHllcyBtYW5pICE='],
  ['leading_zero.csv', ONE_ZERO, 'base64url', 'uAHllcyBtYW5pICE'],
  ['leading_zero.csv', ONE_ZERO, 'base64urlpad', 'UAHllcyBtYW5pICE='],
  ['two_leading_zeros.csv', TWO_ZEROS, 'base58flickr', 'Z117Pznk19XTTzBtx'],
  ['two_leading_zeros.csv', TWO_ZEROS, 'base58btc', 'z117paNL19xttacUY'],
  ['two_leading_zeros.csv', TWO_ZEROS, 'base64', 'mAAB5ZXMgbWFuaSAh'],
  ['two_leading_zeros.csv', TWO_ZEROS, 'base64pad', 'MAAB5ZXMgbWFuaSAh'],
  ['two_leading_zeros.csv', TWO_ZEROS, 'base64url', 'uAAB5ZXMgbWFuaSAh'],
  ['two_leading_zeros.csv', TWO_ZEROS, 'base64urlpad', 'UAAB5ZXMgbWFuaSAh'],
];

const NAMES: MultibaseName[] = ['base58btc', 'base58flickr', 'base64', 'base64pad', 'base64url', 'base64urlpad'];

function expectRefusal(str: string, messagePart: string): void {
  let thrown: Error | undefined;
  try { multibase.decode(str); } catch (e) { thrown = e as Error; }
  expect(thrown, `decode(${JSON.stringify(str)}) should throw`).to.not.eq(undefined);
  expect(thrown!.message).to.contain(messagePart);
  if (str.length > 0) {
    expect(thrown!.message).to.not.contain(str);
  }
}

describe('multibase', () => {
  describe('prefix table', () => {
    it('has exactly the six requested rows', () => {
      expect(multibase.MULTIBASE_PREFIX_TABLE.map((r) => `${r.codepoint} ${r.prefix} ${r.name} ${r.status}`)).to.deep.eq([
        'U+007a z base58btc final',
        'U+005a Z base58flickr experimental',
        'U+006d m base64 final',
        'U+004d M base64pad experimental',
        'U+0075 u base64url final',
        'U+0055 U base64urlpad final',
      ]);
    })
  })

  describe('official test vectors', () => {
    VECTORS.forEach(([file, bytes, name, text]) => {
      it(`${file} ${name} encodes to ${text}`, () => {
        expect(multibase.encode(bytes, name)).to.eq(text)
      })
      it(`${file} ${name} decodes ${text}`, () => {
        const decoded = multibase.decode(text);
        expect(decoded.name).to.eq(name)
        expect(Array.from(decoded.bytes)).to.deep.eq(Array.from(bytes))
      })
    })
  })

  describe('a UUID as 16 bytes', () => {
    const uuidBytes = new Uint8Array('6dfb93da51644eefbd9a0daed5e4ebeb'.match(/../g)!.map((h) => parseInt(h, 16)));
    it('is ubfuT2lFkTu-9mg2u1eTr6w in base64url', () => {
      expect(multibase.encode(uuidBytes, 'base64url')).to.eq('ubfuT2lFkTu-9mg2u1eTr6w')
      expect(Array.from(multibase.decode('ubfuT2lFkTu-9mg2u1eTr6w').bytes)).to.deep.eq(Array.from(uuidBytes))
    })
    it('is zEahwZHMDn9fZtVGVMybqiJ in base58btc', () => {
      expect(multibase.encode(uuidBytes, 'base58btc')).to.eq('zEahwZHMDn9fZtVGVMybqiJ')
      expect(Array.from(multibase.decode('zEahwZHMDn9fZtVGVMybqiJ').bytes)).to.deep.eq(Array.from(uuidBytes))
    })
  })

  describe('encode refuses', () => {
    it('an unknown name from an untyped caller, including Object.prototype keys', () => {
      for (const bad of ['base32', 'constructor', 'toString', '__proto__']) {
        expect(() => multibase.encode(new Uint8Array([1]), bad as MultibaseName)).to.throw('unknown encoding name')
      }
    })
  })

  describe('round trips', () => {
    NAMES.forEach((name) => {
      it(`${name}: random byte arrays of length 0 to 40`, () => {
        for (let len = 0; len <= 40; len++) {
          for (let rep = 0; rep < 20; rep++) {
            const bytes = new Uint8Array(len).map(() => Math.floor(Math.random() * 256));
            const text = multibase.encode(bytes, name);
            const decoded = multibase.decode(text);
            expect(decoded.name).to.eq(name)
            expect(Array.from(decoded.bytes)).to.deep.eq(Array.from(bytes))
            expect(multibase.encode(decoded.bytes, name)).to.eq(text)
          }
        }
      })
      it(`${name}: all-zero inputs of length 0 to 40`, () => {
        for (let len = 0; len <= 40; len++) {
          const bytes = new Uint8Array(len);
          expect(Array.from(multibase.decode(multibase.encode(bytes, name)).bytes)).to.deep.eq(Array.from(bytes))
        }
      })
    })
    it('base58 maps each leading zero byte to one leading 1, both ways', () => {
      expect(multibase.encode(new Uint8Array(3), 'base58btc')).to.eq('z111')
      expect(multibase.encode(new Uint8Array([0, 0, 1]), 'base58btc')).to.eq('z112')
      expect(multibase.encode(new Uint8Array(3), 'base58flickr')).to.eq('Z111')
      expect(Array.from(multibase.decode('z111').bytes)).to.deep.eq([0, 0, 0])
      expect(Array.from(multibase.decode('z').bytes)).to.deep.eq([])
    })
  })

  describe('strict decoding refuses', () => {
    it('an empty string', () => expectRefusal('', 'empty'))
    it('an unknown prefix', () => expectRefusal('f796573', 'unknown prefix U+0066'))
    it('an astral-plane first character, named by its full code point', () => expectRefusal('\u{1F600}abc', 'unknown prefix U+1F600'))
    it('a character outside the base58btc alphabet (0, O, I, l)', () => {
      expectRefusal('z10', "multibase 'z'")
      expectRefusal('z1O', 'position 2')
      expectRefusal('zI', 'position 1')
      expectRefusal('zl', 'position 1')
    })
    it('a character outside the base58flickr alphabet', () => {
      expectRefusal('Z7P0', 'position 3')
    })
    it('a character outside the base64 alphabet', () => {
      expectRefusal('mab-c', "position 3")
      expectRefusal('mab_c', "position 3")
      expectRefusal('uab+c', "position 3")
      expectRefusal('uab/c', "position 3")
      expectRefusal('mab c', "position 3")
    })
    it('padding on the no-padding forms', () => {
      expectRefusal('meWVzIG1hbmkgIQ==', 'padding where none is allowed at position 15')
      expectRefusal('ueWVzIG1hbmkgIQ=', 'padding where none is allowed')
    })
    it('missing padding on the pad forms', () => {
      expectRefusal('MeWVzIG1hbmkgIQ', 'expected 2 padding characters, found 0')
      expectRefusal('UeWVzIG1hbmkgIQ', 'expected 2 padding characters, found 0')
      expectRefusal('MeWVzIG1hbmkgIQ=', 'expected 2 padding characters, found 1')
    })
    it('wrong padding on the pad forms', () => {
      expectRefusal('MeWVzIG1hbmkgIQ===', 'expected 2 padding characters, found 3')
      expectRefusal('MAHllcyBtYW5pICE==', 'expected 1 padding characters, found 2')
      expectRefusal('MAAB5ZXMgbWFuaSAh=', 'expected 0 padding characters, found 1')
    })
    it('padding in the middle of a pad form', () => {
      expectRefusal('MeW=zIG1hbmkgIQ==', 'position 3')
    })
    it('a length no byte string can produce', () => {
      expectRefusal('ma', 'not a valid base64 length') // 1 char of body
      expectRefusal('mAAAAA', 'not a valid base64 length') // 5 chars of body
    })
    it('non-zero unused trailing bits in the base64 forms', () => {
      // 'QQ' is 0x41 with zero trailing bits; 'QR' has a non-zero trailing bit.
      expect(Array.from(multibase.decode('mQQ').bytes)).to.deep.eq([0x41])
      expectRefusal('mQR', 'non-zero unused trailing bits')
      expectRefusal('uQR', 'non-zero unused trailing bits')
      expectRefusal('MQR==', 'non-zero unused trailing bits')
      expectRefusal('UQR==', 'non-zero unused trailing bits')
      // three chars carry 18 bits, 16 used: the last char must have its low 2 bits zero
      expect(Array.from(multibase.decode('mQUE').bytes)).to.deep.eq([0x41, 0x41])
      expectRefusal('mQUF', 'non-zero unused trailing bits')
      expectRefusal('MQUF=', 'non-zero unused trailing bits')
    })
  })
})
