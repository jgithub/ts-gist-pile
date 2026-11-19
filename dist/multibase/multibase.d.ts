export type MultibaseName = 'base58btc' | 'base58flickr' | 'base64' | 'base64pad' | 'base64url' | 'base64urlpad';
export interface MultibasePrefixRow {
    readonly codepoint: string;
    readonly prefix: string;
    readonly name: MultibaseName;
    readonly description: string;
    readonly status?: 'final' | 'experimental';
}
export declare const MULTIBASE_PREFIX_TABLE: readonly MultibasePrefixRow[];
export declare function encode(bytes: Uint8Array, name: MultibaseName): string;
export declare function decode(str: string): {
    name: MultibaseName;
    bytes: Uint8Array;
};
