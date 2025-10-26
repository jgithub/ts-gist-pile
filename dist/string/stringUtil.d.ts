export declare function isPresent(input: string | undefined | null): boolean;
export declare function isEmpty(input: string | undefined | null): boolean;
export declare function isBlank(input: string | undefined | null): boolean;
export declare function isWellFormedCanonicalUuid(input: string | undefined | null): boolean;
export declare function padLeftWithZeros(input: any, notLessThanXDigits: number): string;
export declare function tryRemoveTrailingSlashesIfPresent(input: string | null | undefined): string | null | undefined;
export declare function tryRemoveDoubleSlashesIfPresent(input: string | null | undefined, opt?: {
    butTryToBeSmartAboutUrls: boolean;
}): string | null | undefined;
