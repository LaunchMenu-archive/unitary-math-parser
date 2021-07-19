import {ICSTNode} from "../CST/ICSTNode";

export type IASTBase<N extends string = string, T = unknown> = {
    /** The CST node that this AST node got created from */
    source: ICSTNode;
    /** The name of the type of this node */
    type: N;
} & T;
