import {createEvaluationError} from "../../../parser/AST/createEvaluationError";
import {EvaluationContext} from "../../../parser/AST/EvaluationContext";
import {ICSTNode} from "../../../_types/CST/ICSTNode";
import {IEvaluationErrorObject} from "../../../_types/evaluation/IEvaluationErrorObject";
import {IUnit} from "../../../_types/evaluation/number/IUnit";
import {getDimensionsString} from "./getDimensionsString";

/**
 * Retrieves the evaluation error if the units mismatch
 * @param unitA Unit A to match
 * @param unitB Unit B to match
 * @param context The evaluation context
 * @param source The source of unit B to error on
 * @returns The evaluation error if dimensions mismatch
 */
export function checkDimensionMatch(
    unitA: IUnit,
    unitB: IUnit,
    context: EvaluationContext,
    source: ICSTNode
): IEvaluationErrorObject | undefined {
    const compatible = unitA.hasSameDimensions(unitB);
    if (!compatible) {
        const {missing, extra} = unitB.getDimensionsDifferentFrom(unitA);
        const hasMissing = missing.numerator.length + missing.denominator.length > 0;
        const hasExtra = extra.numerator.length + extra.denominator.length > 0;
        const missingString = hasMissing ? getDimensionsString(missing) : "";
        const extraString = hasExtra ? getDimensionsString(extra) : "";
        const changesString =
            (hasMissing ? `Missing: ${missingString}` : "") +
            (hasMissing && hasExtra ? ", " : "") +
            (hasExtra ? `Extra: ${extraString} ` : "");

        // TODO: improve error message
        return createEvaluationError(
            {
                type: "incompatibleSumUnits",
                message: i => `Incompatible unit found at index ${i}; ${changesString}`,
                multilineMessage: pm =>
                    `Incompatible unit found:\n${pm}\n${changesString}`,
                source,
            },
            context
        );
    }
}
