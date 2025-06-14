// Kinda modeled after https://doc.rust-lang.org/std/result/

export type ResultOrErr<T, E = Error> =
  | { okFlag: true; result: T }
  | { okFlag: false; err: E };