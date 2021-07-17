import {ICSTNode} from "../../_types/CST/ICSTNode";

export type IEvaluationErrorConfig<T extends object | unknown = unknown> = {
    /** The error type name */
    type: string;
    /** Retrieves the message given the index it occurred at*/
    message: (index: number) => string;
    /** Retrieves the multiline message given a string that points at the syntax area */
    multilineMessage: (pointer: string) => string;
    /** The range that the error occured at */
    source: ICSTNode;
    /** Additional optional data */
    extra?: T;
};
