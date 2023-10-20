export class DateProviderServiceImpl implements DateProviderService {
  public getNow(): Date {
    return new Date();
  }
}