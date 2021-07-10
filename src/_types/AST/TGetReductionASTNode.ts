import {IASTBase} from "./IASTBase";
import {IRecursive} from "./IRecursive";
import {TGetASTBaseBody} from "./TGetASTBaseBody";
import {TIsRecursiveNode} from "./TMakeASTRecursive";
/**
 * Obtain the reduction node for a given AST node
 * @param T The node to be converted
 * @param B The data that's reduced to
 * @param L The value to replace as the recursive result in the expression
 */
export type TGetReductionASTNode<
    T extends IASTBase,
    B,
    L = IRecursive<any>
> = TIsRecursiveNode<
    T,
    B,
    T extends IASTBase<infer N, infer C>
        ? IASTBase<N, TRecursiveMap<TGetASTBaseBody<T>, B, L>>
        : never
>;

type TRecursiveMap<T, B, L> = T extends L
    ? B
    : T extends Array<any>
    ? TMapArray<T, B, L>
    : T extends object
    ? TMapObject<T, B, L>
    : T;

type TMapArray<T extends Array<any>, B, L> = T extends [infer F, ...infer R]
    ? [TRecursiveMap<F, B, L>, ...TMapArray<R, B, L>]
    : TMapNonTupleArray<T, B, L>;

type TMapNonTupleArray<T extends Array<any>, B, L> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<TRecursiveMap<U, B, L>>
    : T;

type TMapObject<O extends object, B, L> = {
    [K in keyof O]: TRecursiveMap<O[K], B, L>;
};
