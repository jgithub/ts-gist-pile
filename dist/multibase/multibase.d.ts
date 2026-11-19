declare const ENCODINGS: {
    readonly base58btc: {
        readonly codepoint: "U+007a";
        readonly prefix: "z";
        readonly description: "Base58 Bitcoin";
        readonly status: "final";
        readonly spec: {
            readonly kind: "base58";
            readonly alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        };
    };
    readonly base58flickr: {
        readonly codepoint: "U+005a";
        readonly prefix: "Z";
        readonly description: "Base58 Flicker";
        readonly status: "experimental";
        readonly spec: {
            readonly kind: "base58";
            readonly alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
        };
    };
    readonly base64: {
        readonly codepoint: "U+006d";
        readonly prefix: "m";
        readonly description: "RFC4648 no padding";
        readonly status: "final";
        readonly spec: {
            readonly kind: "base64";
            readonly alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            readonly padded: false;
        };
    };
    readonly base64pad: {
        readonly codepoint: "U+004d";
        readonly prefix: "M";
        readonly description: "RFC4648 with padding - MIME encoding";
        readonly status: "experimental";
        readonly spec: {
            readonly kind: "base64";
            readonly alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            readonly padded: true;
        };
    };
    readonly base64url: {
        readonly codepoint: "U+0075";
        readonly prefix: "u";
        readonly description: "RFC4648 no padding";
        readonly status: "final";
        readonly spec: {
            readonly kind: "base64";
            readonly alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
            readonly padded: false;
        };
    };
    readonly base64urlpad: {
        readonly codepoint: "U+0055";
        readonly prefix: "U";
        readonly description: "RFC4648 with padding";
        readonly status: "final";
        readonly spec: {
            readonly kind: "base64";
            readonly alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
            readonly padded: true;
        };
    };
};
export type MultibaseName = keyof typeof ENCODINGS;
export interface MultibasePrefixRow {
    readonly codepoint: string;
    readonly prefix: string;
    readonly name: MultibaseName;
    readonly description: string;
    readonly status: 'final' | 'experimental';
}
export declare const MULTIBASE_PREFIX_TABLE: readonly MultibasePrefixRow[];
export declare function encode(bytes: Uint8Array, name: MultibaseName): string;
export declare function decode(str: string): {
    name: MultibaseName;
    bytes: Uint8Array;
};
export {};
