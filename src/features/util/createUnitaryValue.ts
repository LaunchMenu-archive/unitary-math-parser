import {isError} from "../../parser/isError";
import {IASTBase} from "../../_types/AST/IASTBase";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {IUnit} from "../../_types/evaluation/number/IUnit";
import {TMapArray} from "../../_types/TMapArray";
import {number} from "./number/number";
import {unitAugmentation} from "./number/unitAugmentation";
import {INumber} from "./number/_types/INumber";

// Since usage of units is so common, this function cuts down on the boilerplate involved
/**
 * Creates a new unit value given the specified node, values and transformation function
 * @param node The node that this node was created from
 * @param values The child values that were used
 * @param perform The function to perform compute the new value and unit
 * @returns The newly obtained number
 */
export function createUnitaryValue<V extends INumber[]>(
    node: IASTBase,
    values: V,
    perform: (
        args: TMapArray<V, INumber, {value: number; unit: IUnit; isPureUnit: boolean}>
    ) =>
        | IEvaluationErrorObject
        | {
              value: number;
              unit: IUnit;
              isPureUnit?: boolean;
          }
): INumber | IEvaluationErrorObject {
    const units = values.map(value => value.getAugmentation(unitAugmentation));
    const result = perform(
        values.map((value, i) => ({
            value: value.data,
            ...units[i],
        })) as any
    );
    if (isError(result)) return result;

    return number.create(result.value, {node, values}).augment(unitAugmentation, {
        unit: result.unit,
        isPureUnit:
            result.isPureUnit !== undefined
                ? result.isPureUnit
                : units.every(unit => unit.isPureUnit),
    });
}
