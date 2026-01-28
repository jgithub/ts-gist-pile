export declare const ALPHABET_58 = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
export declare const ALPHABET_56 = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
export declare function generateShortCode58(length?: number): string;
export declare function generateShortCode56(length?: number): string;
export declare function normalizeShortCode58(shortCode: string): string;
export declare function calculateCombinations(alphabetSize: number, length: number): number;
