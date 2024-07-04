// https://stackoverflow.com/questions/35341696/how-to-convert-map-keys-to-array
export function getKeys<T>(myMap: Map<T, any>): Array<T> {
  return Array.from(myMap.keys());
}