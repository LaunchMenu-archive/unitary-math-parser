import {IValue} from "../../../parser/dataTypes/_types/IValue";
import {number} from "../number/number";
import {createValueFormat} from "./createValueFormat";
import {valueFormat} from "./valueFormat";
import {IFormat} from "./_types/IFormat";

/**
 * Generates all variables for different bases
 * @param start The start base
 * @param end The end base
 */
export function createBaseNumberFormats(
    start: number = 2,
    end: number = 36
): Record<string, IValue> {
    if (start < 2 || end > 36)
        throw Error("Only bases between and including 2 and 36 are allowed");

    // Computes all standard bases under the name pattern `base[x]`
    const regular = Object.fromEntries(
        new Array(end - start + 1)
            .fill(0)
            .map((v, i): [string, IFormat] => [
                `base${i + start}`,
                valueFormat.create(createNumberBaseValueFormat(i + start)),
            ])
    );

    const bin = valueFormat.create(createNumberBaseValueFormat(2, "binary"));
    const oct = valueFormat.create(createNumberBaseValueFormat(8, "octal"));
    const dec = valueFormat.create(createNumberBaseValueFormat(10, "decimal"));
    const hex = valueFormat.create(createNumberBaseValueFormat(16, "hexadecimal"));
    return {
        ...regular,
        bin,
        binary: bin,
        hex,
        hexal: hex,
        hexadecimal: hex,
        oct,
        octal: oct,
        decimal: dec,
    };
}

/**
 * Creates a number format with the given base
 * @param base The radix of the number
 * @param name The name of the format
 * @returns The format
 */
export function createNumberBaseValueFormat(base: number, name: string = `base${base}`) {
    return createValueFormat({
        dataType: number,
        name,
        encode: value => value.toString(base),
        decode: value => {
            const index = getInvalidCharPos(value, base);
            if (index != undefined)
                return {
                    unexpectedChar: value[index],
                    index: index,
                };

            const result = parseFloat(value, base);
            return {value: result ?? 0};
        },
    });
}

/**
 * Parses an integer or float string, in the given radix
 * @param value The value to be parsed
 * @param radix The radix to parse the value in
 * @returns Either the value, or undefined if parsing failed
 */
export function parseFloat(value: string, radix: number = 10): number | undefined {
    const [number, exponentString, ...rest1] = radix >= 14 ? [value] : value.split(/e|E/);
    let multiplier = 1;
    if (exponentString) {
        const exponent = parseInt(exponentString, radix);
        if (isNaN(exponent) || rest1.length > 0) return undefined;
        multiplier = radix ** exponent;
    }

    const [intString, fracString, ...rest2] = number.split(".");
    const int = parseInt(intString, radix);
    if (isNaN(int) || rest2.length > 0) return undefined;
    if (!fracString) return int * multiplier;

    const fracSize = parseInt(fracString, radix);
    if (isNaN(fracSize)) return undefined;
    const divider = radix ** fracString.length;
    return (int + fracSize / divider) * multiplier;
}

/**
 * Retrieves the index of the syntax error in the string
 * @param value The string to get the error for
 * @param radix The radix that this string is supposed to be in
 * @returns The index of the invalid character if any
 */
function getInvalidCharPos(value: string, radix: number = 10): number | undefined {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const charRegex = radix > 10 ? `[0-9a-${chars[radix - 11]}]` : `[0-${radix - 1}]`;
    const regex = new RegExp(
        `-?${charRegex}*(\\.${charRegex}*)?((E|e)-?${charRegex}*)?`,
        "i"
    );
    const index = value.match(regex)?.[0].length;
    return index !== undefined && index < value.length ? index : undefined;
}
