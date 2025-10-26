import { OptionallyCachedValue } from '../container/OptionallyCachedValue';
export declare class ObjectIdFinder {
    private static readonly _mapOfObjectIds;
    static genget(obj: object): OptionallyCachedValue<string>;
    static gengetObjectId(obj: object): string;
}
