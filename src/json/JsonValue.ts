/** A JSON value. `null` IS JSON (RFC 8259 §3); it was missing until 0.0.333, so every nullable field needed a directive. */
export type JsonValue =
    | null
    | string
    | number
    | boolean
    | { [x: string]: JsonValue }
    | Array<JsonValue>;