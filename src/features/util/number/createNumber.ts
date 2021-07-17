import {IUnit} from "../../../_types/evaluation/number/IUnit";
import {IUnitaryNumber} from "../../../_types/evaluation/number/IUnitaryNumber";

/**
 * Creates a unity number
 * @param value The value of the number
 * @param unit The unit of the number
 * @param isUnit Whether the value is purely a unit
 * @returns The unitary number
 */
export function createNumber(
    value: number,
    unit: IUnit,
    isUnit?: boolean
): IUnitaryNumber {
    return {
        value,
        unit,
        isUnit,
        toString: () => value + "" + unit,
    };
}
