import {IASTBase} from "../AST/IASTBase";
import {IEvaluationError} from "./IEvaluationError";
import {ITypeValidator} from "./ITypeValidator";

export type ITypeMismatchEvaluationError = IEvaluationError & {
    /** The node where the mismatch occurred */
    node: IASTBase;
    /** Expected options */
    expected: ITypeValidator[];
    /** The value that was found */
    found: any;
};
