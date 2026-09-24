export type JsonValue = null | string | number | boolean | {
    [x: string]: JsonValue;
} | Array<JsonValue>;
