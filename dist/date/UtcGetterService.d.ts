export interface UtcGetterService {
    getYyyyMmDdStringAtUtc(): string;
    getSpecifiedDateAsUtc(anyDate: Date): Date;
}
