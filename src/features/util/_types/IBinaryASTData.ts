import {IASTExpression} from "../../../_types/AST/IASTExpression";
import {IRecursive} from "../../../_types/AST/IRecursive";

/** The standard AST data for binary operators */
export type IBinaryASTData = {
    left: IRecursive<IASTExpression>;
    right: IRecursive<IASTExpression>;
};
