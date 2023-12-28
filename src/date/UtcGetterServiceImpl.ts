import { dateUtil, numberUtil } from "..";
import { DateProviderService } from "./DateProviderService";
import { UtcGetterService } from "./UtcGetterService";

export class UtcGetterServiceImpl implements UtcGetterService {
  constructor(private readonly dateProviderService: DateProviderService){}

  public getYyyyMmDdStringAtUtc(): string {
    return dateUtil.dateToYyyyMmDdStringAtUtc(this.dateProviderService.getNow())
  }

  public getSpecifiedDateAsUtc(anyDate: Date): Date // UTC date {
  {
    const dateAtUtc: Date = new Date(this.dateProviderService.getNow().toUTCString())
    return dateAtUtc;
  }

}