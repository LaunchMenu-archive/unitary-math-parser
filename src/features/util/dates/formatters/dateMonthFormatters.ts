import {IDateFormatKey} from "../_types/IDateFormatKey";
import {getDaysPerMonth} from "./dateDayFormatters";

export const dateMonthFormatters: Record<string, IDateFormatKey> = {
    /* A full textual representation of a month, such as January or March	January through December */
    F: {
        encode: (date, texts) => texts.months.format(date.getMonth()),
        decode: (dateStr, texts) => {
            const month = texts.months.parse(dateStr);
            if (!month)
                return `Expected a full month representation, E.g. ${texts.months.example}`;

            return {
                parsed: {month: month.index},
                consumedLength: month.text.length,
            };
        },
    },
    /** Numeric representation of a month, with leading zeros	01 through 12 */
    m: {
        encode: date => (date.getMonth() + 1 + "").padStart(2, "0"),
        decode: dateStr => {
            const monthString = dateStr.match(/\d{1,2}/) ?? undefined;
            const month = Number(monthString?.[0]);
            if (isNaN(month) || month < 1 || month > 12)
                return "Expected a valid 2 digit (0 padded) month number";

            return {
                parsed: {month: month - 1},
                consumedLength: monthString![0].length,
            };
        },
    },
    /* A short textual representation of a month, three letters	   Jan through Dec */
    M: {
        encode: (date, texts) => texts.monthsShort.format(date.getMonth()),
        decode: (dateStr, texts) => {
            const month = texts.monthsShort.parse(dateStr);
            if (!month)
                return `Expected a short three letter month representation, E.g. ${texts.monthsShort.example}`;

            return {
                parsed: {month: month.index},
                consumedLength: month.text.length,
            };
        },
    },
    /** Numeric representation of a month, without leading zeros	1 through 12 */
    n: {
        encode: date => date.getMonth() + 1 + "",
        decode: dateStr => {
            const monthString = dateStr.match(/\d{1,2}/) ?? undefined;
            const month = Number(monthString?.[0]);
            if (isNaN(month) || month < 1 || month > 12)
                return "Expected a valid month number";

            return {
                parsed: {month: month - 1},
                consumedLength: monthString![0].length,
            };
        },
    },
    /** Number of days in the given month	 28 through 31 */
    t: {
        encode: date => getDaysPerMonth(date.getFullYear())[date.getMonth()] + "",
        decode: dateStr => {
            const monthDaysString = dateStr.match(/\d{1,2}/) ?? undefined;
            const monthDays = Number(monthDaysString?.[0]);
            if (isNaN(monthDays) || monthDays < 1 || monthDays > 31)
                return "Expected a valid number of days of the month";

            return {
                parsed: {},
                consumedLength: monthDaysString![0].length,
            };
        },
    },
};
