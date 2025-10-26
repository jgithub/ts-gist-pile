export interface JsonApiError {
    id?: string;
    links?: {
        about?: string;
        type?: string;
        [key: string]: unknown;
    };
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
    source?: {
        pointer?: string;
        parameter?: string;
        header?: string;
        [key: string]: unknown;
    };
    meta?: Record<string, unknown>;
}
export type DomainError = JsonApiError;
