import {IASTBase} from "../AST/IASTBase";
import {IASTExpression} from "../AST/IASTExpression";
import {TGetPlainAST} from "../AST/TGetPlainAST";
import {ICSTConversionNode} from "./ICSTConversionNode";
import {ICSTLeaf} from "./ICSTLeaf";

/**
 * Gets the conversion tree for a given CST child data type
 */
export type TGetConversionTree<T extends (ICSTLeaf | IASTBase)[] | undefined> =
    T extends (ICSTLeaf | IASTBase)[] ? ICSTConversionNode<TMapArray<T>> : IASTExpression;

type TMapArray<T extends Array<any>> = T extends [infer F, ...infer R]
    ? [F extends IASTBase ? TGetPlainAST<F> : F, ...TMapArray<R>]
    : TMapNonTupleArray<T>;

type TMapNonTupleArray<T extends Array<any>> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<U extends IASTBase ? TGetPlainAST<U> : U>
    : T;
