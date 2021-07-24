import {IValue} from "../../../parser/dataTypes/_types/IValue";
import {formatAugmentation} from "../formats/formatAugmentation";
import {approximationAugmentation} from "./approximationAugmentation";
import {unitAugmentation} from "./unitAugmentation";

/**
 * Formats the number to a string
 * @param value The value to be formatted
 * @returns The formatted number, and whether it strictly or approximately equals
 */
export function formatNumber(value: IValue<number>): {
    value: string;
    approxEquals: boolean;
} {
    const format = value.getAugmentation(formatAugmentation);
    const unit = value.getAugmentation(unitAugmentation).unit;
    const unitString = (unit + "").length > 0 ? " " + unit : "";

    const convertFormat = format && !["base-10", "decimal"].includes(format.name);
    return {
        value: `${
            format && convertFormat ? format.encode(value.data) : value.data
        }${unitString}${format && convertFormat ? " in " + format.name : ""}`,
        approxEquals: value.getAugmentation(approximationAugmentation),
    };
}
