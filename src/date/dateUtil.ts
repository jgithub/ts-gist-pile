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


/**
 * This can return a negative number if the start date is after the end date.
 * @param start 
 * @param end 
 * @returns a positive or negative number representing milliseconds between the two dates.
 */
export function getMillisecondsBetweenDates(start: Date, end: Date): number {
  return end.getTime() - start.getTime()
}

/**
 * This can return a negative number if the start date is after the end date.
 * @param start 
 * @param end 
 * @returns a positive or negative number representing seconds between the two dates.
 */
export function getSecondsBetweenDates(start: Date, end: Date): number {
  // Returns the number of seconds between two dates.
  return Math.floor((end.getTime() - start.getTime()) / 1000);
}

export function getSecondsBetweenEpochAndDate(date: Date): number {
  // Returns the number of seconds since the Unix epoch (January 1, 1970).
  return Math.floor(date.getTime() / 1000);
}

export function getMillisecondsBetweenEpochAndDate(date: Date): number {
  // Returns the number of milliseconds since the Unix epoch (January 1, 1970).
  return date.getTime();
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