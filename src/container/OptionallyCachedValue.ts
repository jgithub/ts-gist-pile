export class OptionallyCachedValue<T> {
  private readonly cachedFlag: boolean
  private readonly value: T

  constructor(cachedFlag: boolean, value: T) {
    this.cachedFlag = cachedFlag
    this.value = value
  }

  public isCached(): boolean {
    return this.cachedFlag
  }

  public getValue(): T {
    return this.value
  }
}