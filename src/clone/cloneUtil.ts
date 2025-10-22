/**
 * Deep clone an object using native structuredClone()
 * Available in Node 17+ and all modern browsers
 */
export function cloneDeep<T>(obj: T): T {
  return structuredClone(obj);
}

/**
 * Clone an object and apply overrides
 */
export function cloneWithOverrides<T>(original: T, overrides: Partial<T>): T {
  const result = { ...structuredClone(original), ...overrides };
  return result as T;
}