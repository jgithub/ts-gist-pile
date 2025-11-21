export declare function d4l(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export declare function d4lObfuscate(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export declare function d4lPii(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export declare function blurWhereNeeded(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export declare const plain: typeof d4l;
export declare const blur: typeof d4lObfuscate;
export declare const blurIfEnabled: typeof d4lPii;
export declare const p4l: typeof d4l;
export declare const b4l: typeof d4lObfuscate;
export declare const c4l: typeof d4lPii;
export declare const s4l: typeof blurWhereNeeded;
export type LogOptions = {
    joinLines?: boolean;
    obfuscate?: boolean;
};
