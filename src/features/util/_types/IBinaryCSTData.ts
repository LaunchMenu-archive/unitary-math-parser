import {IASTExpression} from "../../../_types/AST/IASTExpression";
import {ICSTLeaf} from "../../../_types/CST/ICSTLeaf";

/** The standard CST data for binary operators */
export type IBinaryCSTData = [IASTExpression, ICSTLeaf, IASTExpression];
