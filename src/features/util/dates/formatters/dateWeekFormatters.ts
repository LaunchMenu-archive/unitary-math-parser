import {IDateFormatKey} from "../_types/IDateFormatKey";
import {
    getDayOfYear,
    getDaysPerMonth,
    computeDateFromDayOfYear,
} from "./dateDayFormatters";

export const dateWeekFormatters: Record<string, IDateFormatKey> = {
    // https://en.wikipedia.org/wiki/ISO_week_date#First_week
    /** ISO-8601 week number of year, weeks starting on Monday	Example: 42 (the 42nd week in the year) */
    W: {
        encode: date => {
            const week = getWeekOfYear(date.getFullYear(), getDayOfYear(date));
            return (week + "").padStart(2, "0");
        },
        decode: dateStr => {
            const weekString = dateStr.match(/\d{1,2}/);
            const week = Number(weekString?.[0]);
            if (isNaN(week) || week < 1 || week > 53)
                return "Expected a week of the year between 1 and 52";

            return {
                parsed: dateParts => {
                    if (!dateParts.year)
                        return "Can't compute the day/month without the year being present";
                    if (!dateParts.day)
                        return "Can't compute the day/month without the day (of the week) being present";

                    // Obtain the full date that has been specified so far
                    const specifiedDate = new Date(
                        `${(dateParts.year + "").padStart(4, "0")}-${
                            (dateParts.month ?? 0) + 1
                        }-${dateParts.day}`
                    );

                    // Determine what day of the year that is, and what week it falls in
                    const dayOfYear = getDayOfYear(specifiedDate);
                    let specifiedWeek = calculate0BasedWeekNumber(
                        dateParts.year,
                        dayOfYear
                    );

                    // Add or subtract a number of days to reach the correct week, and obtain the new month and day of the month
                    let newDayOfYear = (week - specifiedWeek) * 7 + dayOfYear;

                    // Make sure that if an unreachable week is specified, it's interpreted as the last week of the previous year (or week 0 of this year)
                    const lastDayOfYear = getDaysPerMonth(dateParts.year).reduce(
                        (a, b) => a + b
                    );
                    if (newDayOfYear > lastDayOfYear) newDayOfYear = dayOfYear;

                    // Compute the date from the year and day of year
                    return computeDateFromDayOfYear(dateParts.year, newDayOfYear);
                },
                consumedLength: weekString![0].length,
            };
        },
    },
};

/**
 * Retrieves the offset compared to monday being the first day of the year, E.g. if wednesday is the first day of the year, the offset is 2.
 * @param year The year to get the offset for
 * @returns The offset for that year
 */
function getFirstDayOffsetOfYear(year: number) {
    const startOfYear = new Date(`${year}`.padStart(4, "0"));
    const startDayOfWeek = startOfYear.getDay() - 1;
    return startDayOfWeek;
}

/**
 * Retrieves the week number of a given year
 * @param year The year to calculate the week number for
 * @param dayOfYear The day of the year to get the week for
 * @returns The week number, where 0 indicates the last week of the previous year
 */
export function calculate0BasedWeekNumber(year: number, dayOfYear: number): number {
    // Get the week of the year, using the startDayOfWeek to ensure that every new week starts on a monday.
    // If we're in the 0th week, we're in the last week of the last year.
    // If the first day of the year is a monday to thursday, we start in the first week of the year, rather than the last of the previous year
    const startDayOfWeek = getFirstDayOffsetOfYear(year);
    const week =
        Math.floor((dayOfYear + startDayOfWeek) / 7) + (startDayOfWeek <= 3 ? 1 : 0);
    return week;
}

/**
 * Retrieves the week of the year, according to ISO-8601 standard
 * @param year The year to retrieve the week for
 * @param dayOfYear The Nth day of the year to get the week for, starting at 0
 * @returns The week of the year
 */
export function getWeekOfYear(year: number, dayOfYear: number): number {
    // Get the base week number, which may be 0
    let week = calculate0BasedWeekNumber(year, dayOfYear);

    // If we start in the last week of the previous year, calculate what week that is
    if (week == 0) {
        const prevYear = year - 1;
        const lastDayOfPrevYear = getDaysPerMonth(prevYear).reduce((a, b) => a + b);
        week = calculate0BasedWeekNumber(prevYear, lastDayOfPrevYear);
    }

    return week;
}
