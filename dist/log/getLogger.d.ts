type stringorstringfn = string | (() => string);
declare class Logger {
    private readonly loggerName;
    constructor(loggerName: string);
    private buildLogMsg;
    private buildLogMsgJsonFormat;
    private buildCompleteJsonContext;
    private buildLogMsgPlainText;
    private writeLogMsgToTerminal;
    trace(msg: stringorstringfn, context?: JSONContext | Error | undefined, ...extra: any[]): void;
    debug(msg: stringorstringfn, context?: JSONContext | Error | undefined, ...extra: any[]): void;
    info(msg: stringorstringfn, context?: JSONContext | Error | undefined, ...extra: any[]): void;
    notice(msg: stringorstringfn, context?: JSONContext | Error | undefined, ...extra: any[]): void;
    fatal(msg: stringorstringfn, context?: JSONContext | Error | undefined, ...extra: any[]): void;
    warn(msg: string, context?: JSONContext | Error | undefined, ...extra: any[]): void;
    error(msg: string, context?: JSONContext | Error | undefined, ...extra: any[]): void;
}
export declare function getLogger(loggerName: string): Logger;
export declare function withStoreId(storeId: string, fn: () => any): any;
type JSONContext = {
    [key: string]: any;
};
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'FATAL';
export interface LogLevelRule {
    pattern: string;
    level: LogLevel;
}
export declare const LOG_RULES: {
    levels: LogLevelRule[];
};
export declare function resetLogLevelRulesCache(): void;
export {};
