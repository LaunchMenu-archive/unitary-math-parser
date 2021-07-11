import {IASTBase} from "../AST/IASTBase";
import {TMapArray} from "../TMapArray";
import {ICSTLeaf} from "./ICSTLeaf";
import {ICSTNode} from "./ICSTNode";

/**
 * Gets the conversion tree for a given CST child data type
 */
export type TGetCSTNode<T extends (ICSTLeaf | IASTBase)[] | undefined> = T extends (
    | ICSTLeaf
    | IASTBase
)[]
    ? ICSTNode<TMapArray<T, IASTBase, ICSTNode>>
    : ICSTNode;
