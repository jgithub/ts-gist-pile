import { numberUtil } from "..";
import { padLeftWithZeros } from "../string/stringUtil";
import { DateProviderService } from "./DateProviderService";
import { UtcGetterService } from "./UtcGetterService";

export class UtcGetterServiceImpl implements UtcGetterService {
  constructor(private readonly dateProviderService: DateProviderService){}

  public getYyyyMmDdStringAtUtc(): string {
    const dateAtUtc: Date = new Date(this.dateProviderService.getNow().toUTCString())
    const yyyyMmDdString = `${dateAtUtc.getUTCFullYear()}${padLeftWithZeros(dateAtUtc.getUTCMonth() + 1, 2)}${padLeftWithZeros(dateAtUtc.getUTCDate(), 2)}` 
    return yyyyMmDdString
  }
}