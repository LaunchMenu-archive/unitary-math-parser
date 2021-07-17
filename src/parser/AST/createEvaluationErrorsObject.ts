import {IEvaluationError} from "../../_types/evaluation/IEvaluationError";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {createErrorObject} from "../createErrorsObject";

/**
 * Creates an object to hold the passed evaluation errors
 * @param errors The errors to store
 * @returns The object
 */
export function createEvaluationErrorObject<T extends IEvaluationError>(
    errors: T[]
): IEvaluationErrorObject<T> {
    return {
        ...createErrorObject(errors),
        isEvaluationError: true,
    };
}
