export function isTruelike(input: boolean | string | number | undefined | null): boolean {
  if (input == null) {
    return false
  }
  if ([
    'true', 'yes', 't', 'y', '1'
  ].includes(input.toString().trim().toLowerCase())) {
    return true
  }
  return false
}

export const doesImplyTrue = isTruelike
export const isTrueLike = isTruelike
export const isTrueIsh = isTruelike
