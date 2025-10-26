export declare function d4l(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export declare function d4lObfuscate(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export declare function d4lPii(input: string | number | boolean | Error | Array<any> | any, logOptions?: LogOptions): string;
export type LogOptions = {
    joinLines?: boolean;
    obfuscate?: boolean;
};
