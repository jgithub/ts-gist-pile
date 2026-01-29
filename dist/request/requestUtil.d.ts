export interface HttpRequestLike {
    get?(headerName: string): string | undefined;
    headers?: Record<string, string | string[] | undefined>;
    socket?: {
        remoteAddress?: string | null;
    };
}
export declare function extractIpAddress(req: HttpRequestLike): string | null;
