export class BooleanStringPair {
  private readonly booleanValue: boolean
  private readonly stringValue: string

  constructor(booleanValue: boolean, stringValue: string) {
    this.booleanValue = booleanValue
    this.stringValue = stringValue
  }

  public getBooleanValue(): boolean {
    return this.booleanValue
  }

  public getStringValue(): string {
    return this.stringValue
  }
}