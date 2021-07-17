import {ICST} from "../CST/ICST";

/** A type to indicate errors during evaluation */
export type IEvaluationError = {
    /** The error type */
    type: string;
    /** The CST node where the error is located */
    source: ICST;
    /** The error message that can be displayed to the user */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
};
