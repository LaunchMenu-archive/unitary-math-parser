import {IASTBase} from "../AST/IASTBase";
import {ICSTLeaf} from "./ICSTLeaf";
import {ICSTNode} from "./ICSTNode";

/**
 * Gets the conversion tree for a given CST child data type
 */
export type TGetICSTNode<T extends (ICSTLeaf | IASTBase)[] | undefined> = T extends (
    | ICSTLeaf
    | IASTBase
)[]
    ? ICSTNode<
          T extends Array<infer K> ? (K extends ICSTLeaf ? K : ICSTNode)[] : undefined
      >
    : ICSTNode;
