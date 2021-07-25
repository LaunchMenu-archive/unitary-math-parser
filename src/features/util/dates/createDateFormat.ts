import {IValueFormat} from "../formats/_types/IValueFormat";
import {date} from "./date";
import {IDateFormatKey} from "./_types/IDateFormatKey";

/**
 * Creates a new date format using PHP's standard: https://www.php.net/manual/en/datetime.format.php
 * @param format The string representing the format
 * @returns The create date format
 */
export function createDateFormat(format: string): IValueFormat<Date> {
    return {
        dataType: date,
        name: format,
        identifier: Symbol(format),
        decode: (date: string) => {
            //TODO: finish
            return {value: new Date(0)};
        },
        encode: (date: Date) => {
            //TODO: finish
            return "";
        },
    };
}

//TODO: finish
const characters: Record<string, IDateFormatKey> = {
    // d: {
    //     encode: date=>(date.getDate()+"").padStart(2, "0"),
    //     decode: date=>()
    // }
};
