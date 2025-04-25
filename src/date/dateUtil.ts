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
export function isValidDateObject(obj: any): boolean {
  return !!(obj && Object.prototype.toString.call(obj) === "[object Date]" && !isNaN(obj));
}

export function isIso8601(input: string): boolean {
  if (typeof input !== 'string') {
    return false
  }
  return (new Date(input)).toISOString() === input
}

export function isIso8601Utc(input: string): boolean {
  if (typeof input !== 'string') {
    return false
  }
  // return (new Date(input)).toISOString() === input && input.endsWith('Z')

  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(input)) return false;
  const d = new Date(input); 
  return !isNaN(d.getTime()) && d.toISOString()===input; // valid date 

  // https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
}