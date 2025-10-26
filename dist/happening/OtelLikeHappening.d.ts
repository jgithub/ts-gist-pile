export type OtelLikeHappening = {
    event_at: Date;
    service: {
        name: string;
        version?: string;
        namespace?: string;
    };
    event: {
        domain?: "security" | "system" | "transaction" | "audit" | "browser" | string;
        name: string;
    };
    url?: {
        full?: string;
        path?: string;
    };
    http?: {
        response?: {
            status_code?: number;
        };
    };
    client?: {
        address?: string;
        port?: number;
    };
    server?: {
        address?: string;
        port?: number;
    };
    user?: {
        id?: string;
        name?: string;
    };
    session?: {
        id?: string;
    };
    user_agent?: {
        original?: string;
        name?: string;
        version?: string;
    };
    error?: {
        type?: string;
        message?: string;
    };
    [k: `${string}.${string}`]: string | number | boolean | string[] | number[] | boolean[];
    deployment?: {
        environment?: {
            name?: string;
        };
    };
    record_created_at?: Date;
    tags?: string[];
};
