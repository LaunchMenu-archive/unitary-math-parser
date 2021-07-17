import {IErrorObject} from "../IErrorObject";
import {IEvaluationError} from "./IEvaluationError";

/** An object to hold multiple evaluation errors */
export type IEvaluationErrorObject<T extends IEvaluationError = IEvaluationError> =
    IErrorObject<T> & {
        isEvaluationError: true;
    };
