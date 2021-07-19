import {createEvaluationError} from "../../parser/AST/createEvaluationError";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {ICST} from "../../_types/CST/ICST";
import {IUnit} from "../../_types/evaluation/number/IUnit";
import {getDimensionsString} from "./number/getDimensionsString";

/**
 * Creates an error message to signal that the incorrect unit was received
 * @param config The data for the error
 * @returns The created error
 */
export function createInvalidUnitError({
    options,
    source,
    context,
    received,
}: {
    received: IUnit;
    options: IUnit[];
    source: ICST;
    context: EvaluationContext;
}) {
    const optionString = options.map(option =>
        getDimensionsString(option.getDimensions())
    );
    const errorMessage = `Received: ${getDimensionsString(
        received.getDimensions()
    )}, but expected ${optionString[0].match(/[auioe]/) ? "an" : "a"} ${optionString}`;

    return createEvaluationError(
        {
            type: "incorrectUnit",
            message: i => `Found value with wrong unit at index ${i}. ${errorMessage}`,
            multilineMessage: pm =>
                `Found value with wrong unit type:\n${pm}\n${errorMessage}`,
            source: source,
            extra: {received, expected: options},
        },
        context
    );
}
