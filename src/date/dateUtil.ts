/**
 * 
 * @param year 
 * @returns Array of starting unixtime in SECONDS
 */

export function generateSortedFiveMinuteBucketsForYearInSeconds(year: number): number[] {
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

export function dateToYyyyMmDdStringAtUtc(date: Date): string {
  const dateAtUtc: Date = new Date(date.toUTCString())
  const yyyyMmDdString = `${dateAtUtc.getUTCFullYear()}${padLeftWithZeros(dateAtUtc.getUTCMonth() + 1, 2)}${padLeftWithZeros(dateAtUtc.getUTCDate(), 2)}` 
  return yyyyMmDdString
}

export function getDateInLondon(date: Date): Date {
  const dateAtUtc: Date = new Date(date.toUTCString())
  return dateAtUtc
}

function padLeftWithZeros(input: any, notLessThanXDigits: number): string {
  let workingValue: string = input.toString();
  while (workingValue.length < notLessThanXDigits) {
    workingValue = "0" + workingValue;
  }
  return workingValue;
}

export function getMillisecondsSinceDate(dateStart: Date): number {
  return new Date().getTime() - dateStart.getTime()
}

// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
export function isDate(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Date]'
}