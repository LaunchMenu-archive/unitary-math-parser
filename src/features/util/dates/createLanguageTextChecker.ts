import {ILanguageTextChecker} from "./_types/IDateLanguageTexts";

/**
 * Creates a language text checker given a list of options
 * @param options The options to be used
 * @param loop Whether values should loop
 * @returns The text checker
 */
export function createLanguageTextChecker(
    options: string[],
    loop: boolean = false
): ILanguageTextChecker {
    return {
        format: index => options[loop ? index % options.length : index],
        parse: text => {
            const index = options.findIndex(
                t => t.toLowerCase() == text.substring(0, t.length).toLowerCase()
            );
            if (index == -1) return undefined;
            return {index, text: text.substring(0, options[index].length)};
        },
        example: options[0],
    };
}
