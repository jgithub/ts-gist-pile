export declare class OptionallyCachedValue<T> {
    private readonly cachedFlag;
    private readonly value;
    constructor(cachedFlag: boolean, value: T);
    isCached(): boolean;
    getValue(): T;
}
