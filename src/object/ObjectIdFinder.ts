import { v6 } from 'uuid';
import { BooleanStringPair } from '../container/BooleanStringPair';
import { OptionallyCachedValue } from '../container/OptionallyCachedValue';

export class ObjectIdFinder {
  private static readonly _mapOfObjectIds: WeakMap<object, string> = new WeakMap<object, string>()

  /**
   * 
   * @param obj 
   * @returns a OptionallyCachedValue<string> object where the boolean value is true if the object is already being tracked/cached.
   */

  public static genget(obj: object): OptionallyCachedValue<string> {
    let objectId: string | undefined = ObjectIdFinder._mapOfObjectIds.get(obj)!
    
    if (objectId != null) {
      return new OptionallyCachedValue(true, objectId)
    } else {
      objectId = v6()
      ObjectIdFinder._mapOfObjectIds.set(obj, objectId)
      return new OptionallyCachedValue(false, objectId)
    }
  }

  public static gengetObjectId(obj: object): string /* UUID */ {
    const pair = ObjectIdFinder.genget(obj);
    return pair.getValue();
  }
}