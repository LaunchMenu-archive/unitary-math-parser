import {IDataType} from "../../parser/dataTypes/_types/IDataType";
import {IASTBase} from "../AST/IASTBase";
import {IEvaluationError} from "./IEvaluationError";

export type ITypeMismatchEvaluationError = IEvaluationError & {
    /** The node where the mismatch occurred */
    node: IASTBase;
    /** Expected options */
    expected: IDataType<any>[];
    /** The value that was found */
    found: any;
};
