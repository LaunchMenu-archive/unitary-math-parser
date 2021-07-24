import {ICST} from "../../_types/CST/ICST";

export type IEvaluationErrorConfig<T extends object | unknown = unknown> = {
    /** The error type name */
    type: string;
    /** Retrieves the message given the index it occurred at*/
    message: (index: number) => string;
    /** Retrieves the multiline message given a string that points at the syntax area */
    multilineMessage: (pointer: string) => string;
    /** The range that the error occured at */
    source: ICST;
    /** The range of text where the error occurred */
    range?: {start: number; end?: number};
    /** Additional optional data */
    extra?: T;
};
