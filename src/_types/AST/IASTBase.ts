import {ICST} from "../CST/ICST";

export type IASTBase<N extends string = string, T = unknown> = {
    /** The CST node that this AST node got created from */
    source: ICST;
    /** The name of the type of this node */
    type: N;
} & T;
