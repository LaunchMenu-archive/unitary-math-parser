import {IDateFormatKey} from "../_types/IDateFormatKey";
import {
    getDayOfYear,
    getDaysPerMonth,
    computeDateFromDayOfYear,
} from "./dateDayFormatters";

export const dateTimeFormatters: Record<string, IDateFormatKey> = {
    /** Lowercase Ante meridiem and Post meridiem	am or pm */
    a: {
        encode: (date, texts) => texts.amOrPm.format(date.getHours() >= 12 ? 1 : 0),
        decode: (dateStr, texts) => {
            const amOrPm = texts.amOrPm.parse(dateStr);
            if (!amOrPm)
                return `Expected a short 2 letter ante or post meridiem identifier, E.g. ${texts.amOrPm.example}`;
            return {
                parsed: dateParts => {
                    let hour = (dateParts.hour ?? 0) % 12;
                    if (amOrPm.index == 1) hour += 12;
                    return {hour: hour % 24};
                },
                consumedLength: amOrPm.text.length,
            };
        },
    },
    /** Uppercase Ante meridiem and Post meridiem	AM or PM */
    A: {
        encode: (date, texts) => texts.AMorPM.format(date.getHours() >= 12 ? 1 : 0),
        decode: (dateStr, texts) => {
            const amOrPm = texts.AMorPM.parse(dateStr);
            if (!amOrPm)
                return `Expected a short 2 letter ante or post meridiem identifier, E.g. ${texts.AMorPM.example}`;
            return {
                parsed: dateParts => {
                    let hour = (dateParts.hour ?? 0) % 12;
                    if (amOrPm.index == 1) hour += 12;
                    return {hour: hour % 24};
                },
                consumedLength: amOrPm.text.length,
            };
        },
    },
    /** Swatch Internet time	000 through 999 */
    B: {
        // TODO: accommodate for timezone (subtract timezone when encoding, CET)
        encode: date =>
            (
                Math.floor(((date.getHours() + date.getMinutes() / 60) / 24) * 1000) + ""
            ).padStart(3, "0"),
        decode: dateStr => {
            const timeString = dateStr.match(/\d{1,3}/) ?? undefined;
            const time = Number(timeString?.[0]);
            if (isNaN(time))
                return "Expected a valid 3 digit (0 padded) swatch internet time";

            const timeInHours = (time / 1000) * 24;
            const hour = Math.floor(timeInHours);
            const minute = Math.floor((timeInHours - hour) * 60);
            return {
                parsed: {hour, minute},
                consumedLength: timeString![0].length,
            };
        },
    },
    /** 12-hour format of an hour without leading zeros  	1 through 12 */
    g: {
        encode: date => ((date.getHours() - 1 + 12) % 12) + 1 + "",
        decode: dateStr => {
            const hourString = dateStr.match(/\d{1,2}/) ?? undefined;
            const hour = Number(hourString?.[0]);
            if (isNaN(hour) || hour < 1 || hour > 12)
                return "Expected a valid 12 hour clock number";

            return {
                parsed: {hour},
                consumedLength: hourString![0].length,
            };
        },
    },
    /**	24-hour format of an hour without leading zeros 	0 through 23 */
    G: {
        encode: date => date.getHours() + "",
        decode: dateStr => {
            const hourString = dateStr.match(/\d{1,2}/) ?? undefined;
            const hour = Number(hourString?.[0]);
            if (isNaN(hour) || hour < 0 || hour > 23)
                return "Expected a valid 24 hour clock number";

            return {
                parsed: {hour},
                consumedLength: hourString![0].length,
            };
        },
    },
    /** 12-hour format of an hour with leading zeros	01 through 12 */
    h: {
        encode: date => (((date.getHours() - 1 + 12) % 12) + 1 + "").padStart(2, "0"),
        decode: dateStr => {
            const hourString = dateStr.match(/\d{1,2}/) ?? undefined;
            const hour = Number(hourString?.[0]);
            if (isNaN(hour) || hour < 1 || hour > 12)
                return "Expected a valid 2 digit (0 padded) 12 hour clock number";

            return {
                parsed: {hour},
                consumedLength: hourString![0].length,
            };
        },
    },
    /**	24-hour format of an hour with leading zeros	00 through 23 */
    H: {
        encode: date => (date.getHours() + "").padStart(2, "0"),
        decode: dateStr => {
            const hourString = dateStr.match(/\d{1,2}/) ?? undefined;
            const hour = Number(hourString?.[0]);
            if (isNaN(hour) || hour < 0 || hour > 23)
                return "Expected a valid 2 digit (0 padded) 24 hour clock number";

            return {
                parsed: {hour},
                consumedLength: hourString![0].length,
            };
        },
    },
    /** Minutes with leading zeros  	00 to 59 */
    i: {
        encode: date => (date.getMinutes() + "").padStart(2, "0"),
        decode: dateStr => {
            const minuteString = dateStr.match(/\d{1,2}/) ?? undefined;
            const minute = Number(minuteString?.[0]);
            if (isNaN(minute) || minute < 0 || minute > 59)
                return "Expected a valid 2 digit (0 padded) minute number";

            return {
                parsed: {minute},
                consumedLength: minuteString![0].length,
            };
        },
    },
    /** Seconds with leading zeros	 00 through 59 */
    s: {
        encode: date => (date.getSeconds() + "").padStart(2, "0"),
        decode: dateStr => {
            const secondString = dateStr.match(/\d{1,2}/) ?? undefined;
            const second = Number(secondString?.[0]);
            if (isNaN(second) || second < 0 || second > 59)
                return "Expected a valid 2 digit (0 padded) second number";

            return {
                parsed: {second},
                consumedLength: secondString![0].length,
            };
        },
    },
    /** Microseconds	 Example: 654321 */
    u: {
        encode: date => (date.getMilliseconds() * 1000 + "").padStart(6, "0"),
        decode: dateStr => {
            const microsecondString = dateStr.match(/\d{1,6}/) ?? undefined;
            const microsecond = Number(microsecondString?.[0]);
            if (isNaN(microsecond))
                return "Expected a valid 6 digit (0 padded) microsecond number";

            return {
                parsed: dateParts => {
                    const second = dateParts.second ?? 0;
                    return {second: second + microsecond / 1e6};
                },
                consumedLength: microsecondString![0].length,
            };
        },
    },
    /** Milliseconds	 Example: 654 */
    v: {
        encode: date => (date.getMilliseconds() + "").padStart(3, "0"),
        decode: dateStr => {
            const millisecondString = dateStr.match(/\d{1,3}/) ?? undefined;
            const millisecond = Number(millisecondString?.[0]);
            if (isNaN(millisecond))
                return "Expected a valid 3 digit (0 padded) millisecond number";

            return {
                parsed: dateParts => {
                    const second = dateParts.second ?? 0;
                    return {second: second + millisecond / 1e3};
                },
                consumedLength: millisecondString![0].length,
            };
        },
    },
};
