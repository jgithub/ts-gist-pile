import { DateProviderService } from "./DateProviderService";
import { UtcGetterService } from "./UtcGetterService";
export declare class UtcGetterServiceImpl implements UtcGetterService {
    private readonly dateProviderService;
    constructor(dateProviderService: DateProviderService);
    getYyyyMmDdStringAtUtc(): string;
    getSpecifiedDateAsUtc(anyDate: Date): Date;
}
