import { Brand } from '../type/Brand';
export type ImmutableUtc = Brand<string, 'ImmutableUtc'>;
export declare const ImmutableUtc: {
    fromDate: (date: Date) => ImmutableUtc;
    now: () => ImmutableUtc;
    parse: (dateString: string) => Date;
    toDate: (immutableUtc: ImmutableUtc) => Date;
    fromMillis: (timestamp: number) => ImmutableUtc;
    toMillis: (immutableUtc: ImmutableUtc) => number;
    fromSeconds: (timestamp: number) => ImmutableUtc;
    toSeconds: (immutableUtc: ImmutableUtc) => number;
    isValid: (value: any) => value is ImmutableUtc;
    compare: (a: ImmutableUtc, b: ImmutableUtc) => number;
    min: (a: ImmutableUtc, b: ImmutableUtc) => ImmutableUtc;
    max: (a: ImmutableUtc, b: ImmutableUtc) => ImmutableUtc;
};
