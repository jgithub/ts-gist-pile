type stringorstringfn = string | (() => string);
declare class Logger {
    private readonly loggerName;
    constructor(loggerName: string);
    private buildLogMsg;
    private buildLogMsgJsonFormat;
    private buildCompleteJsonContext;
    private buildLogMsgPlainText;
    private writeLogMsgToTerminal;
    trace(msg: stringorstringfn, jsonContext?: JSONContext, ...extra: any[]): void;
    debug(msg: stringorstringfn, jsonContext?: JSONContext, ...extra: any[]): void;
    info(msg: stringorstringfn, jsonContext?: JSONContext, ...extra: any[]): void;
    notice(msg: stringorstringfn, jsonContext?: JSONContext, ...extra: any[]): void;
    fatal(msg: stringorstringfn, jsonContext?: JSONContext, ...extra: any[]): void;
    warn(msg: string, jsonContext?: JSONContext, ...extra: any[]): void;
    error(msg: string, jsonContext?: JSONContext, ...extra: any[]): void;
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
