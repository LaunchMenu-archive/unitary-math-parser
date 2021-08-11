/** A part of a date format */
export type IDateFormatKey = {
    /**
     * Decodes part of the date
     * @param date The remaining date string
     * @returns The part that remains after applying this key, and the data that was extracted from it, or an error message if parsing failed
     */
    decode(
        date: string
    ):
        | {
              consumedLength: number;
              parsed: IDateParts | {(parts: IDateParts): string | IDateParts};
          }
        | string;

    /**
     * Encodes part of the date to a string
     * @param date THe date to encode data from
     * @returns The encoded string part
     */
    encode(date: Date): string;
};

export type IDateParts = {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
};
