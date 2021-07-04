import {IASTBase} from "./IASTBase";

/** A placeholder type for the recursive node */
export type IASTRecursive = IASTBase<string, {recursivePlaceHolder: never}>;
