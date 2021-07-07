import {IASTBase} from "./IASTBase";

/** A placeholder type for the recursive expression nodes */
export type IASTExpression = IASTBase<string, {recursivePlaceHolder: never}>;
