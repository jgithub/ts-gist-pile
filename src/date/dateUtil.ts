export function generateSortedFiveMinuteBucketsForYear(year: number): number[] {
  const firstMomentOfYear = Date.UTC(year, 0, 0, 0, 0, 0)
  const firstMomentOfNextYear = Date.UTC(year + 1, 0, 0, 0, 0, 0)

  const retval = []
  let workingValueInMilliseconds = firstMomentOfYear
  while (workingValueInMilliseconds < firstMomentOfNextYear) {
    retval.push(workingValueInMilliseconds / 1000) // array of seconds NOT milliseconds
    workingValueInMilliseconds += (5 * 60 * 1000) // 5 minutes in seconds later
  }
  return retval
}