/** The texts to be used for a date */
export type IDateLanguageTexts = {
    /** Mon through Fri */
    daysOfWeekShort: ILanguageTextChecker;
    /** Monday through Friday */
    daysOfWeek: ILanguageTextChecker;
    /** Ordinal suffixes for each number, E.g. rd */
    ordinalSuffix: ILanguageTextChecker;
    /** Jan through Dec */
    monthsShort: ILanguageTextChecker;
    /** January through December */
    months: ILanguageTextChecker;
};

export type ILanguageTextChecker = {
    /** An example text */
    example: string;
    /**
     * Parses the given text
     * @returns The input text, including the remaining date to be parsed (and should be ignored)
     * @returns The index and text that was parsed, or undefined
     */
    parse(text: string):
        | {
              /** The value that was found */
              index: number;
              /** The text that was matched/consumed */
              text: string;
          }
        | undefined;
    /**
     * Formats the value at the given index
     * @param index The index of the value
     * @returns The formatted text
     */
    format(index: number): string;
};
