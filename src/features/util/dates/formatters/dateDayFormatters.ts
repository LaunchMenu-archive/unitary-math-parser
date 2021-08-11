import {IDateFormatKey, IDateParts} from "../_types/IDateFormatKey";

const dayOfWeekShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const ordinalSuffix = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];

/**
 * Checks whether a given year is a leap year
 * @param y The year to be checked
 * @returns Whether the given year is a leap year
 */
export function isLeapYear(y: number): boolean {
    return y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
}

/**
 * Retrieves the number of days in every given month, considering leap years
 * @param year The year to get the days for
 * @returns A list of number of days per month
 */
export function getDaysPerMonth(year: number): number[] {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

export const dateDayFormatters: Record<string, IDateFormatKey> = {
    /* Day of the month, 2 digits with leading zeros    01 to 31 */
    d: {
        encode: date => (date.getDate() + "").padStart(2, "0"),
        decode: dateStr => {
            const dayString = dateStr.match(/\d{1,2}/) ?? undefined;
            const day = Number(dayString?.[0]);
            if (isNaN(day) || day < 1 || day > 31)
                return "Expected a valid 2 digit (0 padded) day of the month";

            return {
                parsed: {day},
                consumedLength: dayString![0].length,
            };
        },
    },
    /* A textual representation of a day, three letters	    Mon through Sun */
    D: {
        encode: date => dayOfWeekShort[date.getDay() - 1],
        decode: dateStr => {
            const day = dayOfWeekShort.findIndex(
                text =>
                    dateStr.substring(0, text.length).toLowerCase() == text.toLowerCase()
            );
            if (day == -1)
                return "Expected a three letter representation of the day of the week, E.g. Fri";
            return {
                // TODO: add parser
                parsed: createDayOfWeekParser(day),
                consumedLength: 3,
            };
        },
    },
    /* Day of the month without leading zeros	1 to 31 */
    j: {
        encode: date => date.getDate() + "",
        decode: dateStr => {
            const dayString = dateStr.match(/\d{1,2}/) ?? undefined;
            const day = Number(dayString?.[0]);
            if (isNaN(day) || day < 1 || day > 31)
                return "Expected a valid day of the month";
            return {
                parsed: {day},
                consumedLength: dayString![0].length,
            };
        },
    },
    /* A full textual representation of the day of the week    Sunday through Saturday */
    l: {
        encode: date => dayOfWeek[date.getDay() - 1],
        decode: dateStr => {
            const day = dayOfWeek.findIndex(
                text =>
                    dateStr.substring(0, text.length).toLowerCase() == text.toLowerCase()
            );
            if (day == -1) return "Expected a day of the week, E.g. Friday";
            return {
                parsed: createDayOfWeekParser(day),
                consumedLength: dayOfWeek[day].length,
            };
        },
    },
    /* SO-8601 numeric representation of the day of the week	1 (for Monday) through 7 (for Sunday) */
    N: {
        encode: date => date.getDay() + "",
        decode: dateStr => {
            const day = Number(dateStr[0]);
            if (isNaN(day) || day < 1 || day > 7)
                return "Expected a ISO-8601 day of the week index, E.g. 1 for Monday";
            return {
                parsed: createDayOfWeekParser(day - 1),
                consumedLength: 1,
            };
        },
    },
    /* English ordinal suffix for the day of the month, 2 characters	st, nd, rd or th. Works well with j */
    S: {
        encode: date => ordinalSuffix[date.getDate() % 10],
        decode: dateStr => {
            const matches = dateStr.substring(0, 2).match(/th|st|nd|rd|/);
            if (!matches) return "Expected a ordinal suffix such as 'th'";
            return {
                parsed: {},
                consumedLength: 2,
            };
        },
    },
    /* Numeric representation of the day of the week    0 (for Sunday) through 6 (for Saturday) */
    w: {
        encode: date => date.getDay() - 1 + "",
        decode: dateStr => {
            const day = Number(dateStr[0]);
            if (isNaN(day) || day < 0 || day > 6)
                return "Expected a ISO-8601 day of the week index, E.g. 0 for Monday";
            return {
                // TODO: add parser
                parsed: createDayOfWeekParser(day),
                consumedLength: 1,
            };
        },
    },
    /* The day of the year (starting from 0)	0 through 365 */
    z: {
        encode: date => getDayOfYear(date) + "",
        decode: dateStr => {
            const dayString = dateStr.match(/\d{1,3}/) ?? undefined;
            const day = Number(dayString?.[0]);
            if (isNaN(day) || day < 0 || day > 365)
                return "Expected a day of the year between 0 and 365";
            return {
                // TODO: add extensive tests, including leap year tests for edge cases
                parsed: dateParts => {
                    if (!dateParts.year)
                        return "Can't compute the day without the year being present";
                    return computeDateFromDayOfYear(dateParts.year, day);
                },
                consumedLength: dayString![0].length,
            };
        },
    },
};

/**
 * Retrieves the day of the year given a date
 * @param date The date to get the day of the year for
 * @returns The day of the year, starting at 0
 */
export function getDayOfYear(date: Date): number {
    const y = date.getFullYear();
    return (
        getDaysPerMonth(y)
            .slice(0, date.getMonth() - 1)
            .reduce((a, b) => a + b, 0) +
        (date.getDate() - 1)
    );
}

/**
 * Computes the day and month based on the day of the year and the year it's for
 * @param year The year to compute the day and month for
 * @param dayOfYear The day of the year
 * @returns Either an error message, or the day and month
 */
export function computeDateFromDayOfYear(
    year: number,
    dayOfYear: number
): string | IDateParts {
    let d = dayOfYear + 1;
    const months = getDaysPerMonth(year);
    for (let i = 0; i < months.length; i++) {
        const days = months[i];
        if (days >= d) return {day: d, month: i + 1};
        d -= days;
    }
    return "Year wasn't a leap year";
}

/**
 * Creates a day encoder, given a 0-based day of the week
 * @param day The day to be encoded into a specified date
 * @returns The encoder that formulates the day of the week into a day of the month given a year and month
 */
function createDayOfWeekParser(day: number) {
    return (dateParts: IDateParts) => {
        if (!dateParts.year)
            return "Can't compute the day without the year being present";
        const month = dateParts.month ?? 0;
        const date = new Date(`${dateParts.year}-${month + 1}-1`);
        const startDay = date.getDay();
        const delta = (day - startDay + 7) % 7;

        return {
            day: delta,
        };
    };
}
