import { expect } from 'chai';
import { keysOf } from "../../src/index";
import * as browserEntry from "../../src/index.browser";

// keysOf() exists so a request body, query, cookie jar or context store can be logged without its values: each test
// that plants a value asserts that value never reaches the output.
describe('logUtil.keysOf()', () => {
  it('lists every key, sorted, and no value', () => {
    const body = { username: 'ada', password: 'hunter2', code: '123456', email: 'ada@example.com' }
    const printed = keysOf(body)
    expect(printed).to.eql('["code", "email", "password", "username"] (keys, 4)')
    for (const value of Object.values(body)) {
      expect(printed).not.to.include(value)
    }
  })

  it('lists every key of a wide object, not the first and the last', () => {
    const wide: Record<string, number> = {}
    for (const key of ['a', 'b', 'c', 'd', 'e']) {
      wide[key] = 1
    }
    expect(keysOf(wide)).to.eql('["a", "b", "c", "d", "e"] (keys, 5)')
  })

  it('prints an empty object as no keys', () => {
    expect(keysOf({})).to.eql('[] (keys, 0)')
  })

  it('reads an object with no prototype (how qs parses a query string)', () => {
    const query = Object.create(null)
    query.state = 'forgeable-state'
    expect(keysOf(query)).to.eql('["state"] (keys, 1)')
  })

  it('JSON-quotes each key, so a newline in a key cannot start a new log line', () => {
    const printed = keysOf({ 'a\nINFO forged line': 1 })
    expect(printed).not.to.include('\n')
    expect(printed).to.eql('["a\\nINFO forged line"] (keys, 1)')
  })

  it('prints a key longer than 64 characters as its length: a token sent as ?<token> is a query key', () => {
    const token = 'x'.repeat(65)
    const printed = keysOf({ [token]: '', sd: '1x1' })
    expect(printed).not.to.include(token)
    expect(printed).to.eql('["sd", <key of 65 chars>] (keys, 2)')
  })

  it('keeps a key of exactly 64 characters', () => {
    const key = 'k'.repeat(64)
    expect(keysOf({ [key]: 1 })).to.eql(`["${key}"] (keys, 1)`)
  })

  it('runs no getter', () => {
    let read = false
    const watched = Object.defineProperty({}, 'secret', { enumerable: true, get: () => { read = true; return 's3cret' } })
    expect(keysOf(watched)).to.eql('["secret"] (keys, 1)')
    expect(read).to.eql(false)
  })

  it('formats null and undefined as d4l() does', () => {
    expect(keysOf(null)).to.eql('<null> (null)')
    expect(keysOf(undefined)).to.eql('<undefined> (undefined)')
  })

  it('never prints a string, only its length', () => {
    const printed = keysOf('Bearer eyJhbGciOi')
    expect(printed).to.eql('<string> (length 17, no keys)')
  })

  it('never prints a number, a boolean or a function', () => {
    expect(keysOf(4111111111111111)).to.eql('<number> (no keys)')
    expect(keysOf(true)).to.eql('<boolean> (no keys)')
    expect(keysOf(() => 'secret')).to.eql('<function> (no keys)')
  })

  it('prints an array as its length: its indexes are not field names', () => {
    expect(keysOf(['a-token', 'another'])).to.eql('Array(len=2) (no keys)')
  })

  it('prints a Map or a Set as its size: their keys are data', () => {
    expect(keysOf(new Map([['ada@example.com', 1]]))).to.eql('Map(size=1) (no keys)')
    expect(keysOf(new Set(['ada@example.com']))).to.eql('Set(size=1) (no keys)')
  })

  // A raw request body (bodyParser.raw) is a Buffer: listing its byte indexes made a 5 MB body a 56 MB log line.
  it('prints binary data as its byte length, never its indexes or bytes', () => {
    expect(keysOf(Buffer.from('secret'))).to.eql('Buffer(byteLength=6) (no keys)')
    expect(keysOf(new Uint8Array([115, 51, 99]))).to.eql('Uint8Array(byteLength=3) (no keys)')
    expect(keysOf(new ArrayBuffer(16))).to.eql('ArrayBuffer(byteLength=16) (no keys)')
    expect(keysOf(new DataView(new ArrayBuffer(4)))).to.eql('DataView(byteLength=4) (no keys)')
  })

  it('prints a large Buffer in a short line', () => {
    expect(keysOf(Buffer.alloc(1024 * 1024))).to.eql('Buffer(byteLength=1048576) (no keys)')
  })

  it('prints a boxed primitive as its primitive would, never its index keys or its value', () => {
    expect(keysOf(new String('pw'))).to.eql('<string> (length 2, no keys)')
    expect(keysOf(new Number(4111))).to.eql('<number> (no keys)')
    expect(keysOf(new Boolean(true))).to.eql('<boolean> (no keys)')
  })

  it('is exported from the browser entry point', () => {
    expect(browserEntry.keysOf).to.equal(keysOf)
  })
})
