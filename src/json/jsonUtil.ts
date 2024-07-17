import cloneDeep from 'lodash/cloneDeep'


export function recursivelyFilterPropertiesInPlace<T>(obj: T, listOfPropertyNamesToRemove: Array<string>): void {
  if(Array.isArray(obj)){
    obj.forEach((item) => {
      recursivelyFilterPropertiesInPlace(item, listOfPropertyNamesToRemove)
    });
  }
  else if(typeof obj === 'object' && obj != null){
    Object.getOwnPropertyNames(obj).forEach(function(key){
      if(listOfPropertyNamesToRemove.indexOf(key) !== -1)delete (obj as any)[key];
      else recursivelyFilterPropertiesInPlace((obj as any)[key],listOfPropertyNamesToRemove);
    });
  }
}

export function recursivelyFilterPropertiesCopy<T>(obj: T, listOfPropertyNamesToRemove: Array<string>): T {
  const clone = cloneDeep(obj)
  recursivelyFilterPropertiesInPlace(clone, listOfPropertyNamesToRemove)
  return clone;
}