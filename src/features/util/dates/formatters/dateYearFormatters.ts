import {IDateFormatKey} from "../_types/IDateFormatKey";
import {isLeapYear, getDayOfYear} from "./dateDayFormatters";
import {calculate0BasedWeekNumber} from "./dateWeekFormatters";

export const dateYearFormatters: Record<string, IDateFormatKey> = {
    /* Whether it's a leap year	   1 if it is a leap year, 0 otherwise. */
    L: {
        encode: date => (isLeapYear(date.getFullYear()) ? "1" : "0"),
        decode: dateStr => {
            if (!["0", "1"].includes(dateStr[0]))
                return "Expected an indicator of it being a leap year, 1 or 0";

            return {
                parsed: {},
                consumedLength: 1,
            };
        },
    },
    /** ISO-8601 week-numbering year. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead   Examples: 1999 or 2003 */
    o: {
        encode: date => {
            let year = date.getFullYear();
            const week = calculate0BasedWeekNumber(year, getDayOfYear(date));
            if (week == 0) year--;

            return (year + "").padStart(4, "0");
        },
        decode: dateStr => {
            return "The week-numbering year can't be used for parsing";
        },
    },
    /** A full numeric representation of a year, 4 digits	Examples: 1999 or 2003 */
    Y: {
        encode: date => {
            const year = date.getFullYear();
            return (year < 0 ? "-" : "") + (Math.abs(year) + "").padStart(4, "0");
        },
        decode: dateStr => {
            const yearStr = dateStr.substring(0, 4);
            const year = Number(yearStr);
            if (isNaN(year)) return "Expected a 4 digit year number";
            return {
                parsed: {year},
                consumedLength: 4,
            };
        },
    },
    /** A two digit representation of a year	Examples: 99 or 03 */
    y: {
        encode: date => {
            const year = date.getFullYear();
            return (
                (year < 0 ? "-" : "") +
                (Math.abs(year) + "").padStart(4, "0").substring(2)
            );
        },
        decode: dateStr => {
            const yearStr = dateStr.substring(0, 2);
            const year = Number(yearStr);
            if (isNaN(year)) return "Expected a 2 digit year number";
            return {
                parsed: {year: (year < 70 ? 2000 : 1900) + year},
                consumedLength: 2,
            };
        },
    },
};
