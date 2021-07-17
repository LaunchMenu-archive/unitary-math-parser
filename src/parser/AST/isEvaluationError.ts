import {IEvaluationError} from "../../_types/evaluation/IEvaluationError";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {isError} from "../isError";

/**
 * Checks whether a given error is an evaluation error
 * @param data The data to check to be an error object
 * @returns Whether the data is an evaluation error object
 */
export function isEvaluationError<T extends IEvaluationError>(
    data: Object | IEvaluationErrorObject<T>
): data is IEvaluationErrorObject<T> {
    return isError(data) && data.isEvaluationError;
}
