import {IASTBase} from "./IASTBase";
import {IASTRecursive} from "./IASTRecursive";

/**
 * Replaces occurrences of the recursive node type by the actual recursive type
 */
export type TMakeASTRecursive<
    T extends IASTBase<string>,
    S extends IASTBase<string> = T
> = T extends infer A
    ? A extends IASTBase
        ? TIsRecursiveNode<A, never, TRecursionObject<A, S>>
        : never
    : never;

/** Replaces all recursive AST nodes by S in object T */
type TRecursionObject<T extends object, S extends IASTBase> = {
    [K in keyof T]: T[K] extends Array<any>
        ? TRecursionArray<T[K], S>
        : TIsRecursiveNode<T[K], TMakeASTRecursive<S>, T[K]>;
};

/** Replaces all recursive AST nodes by S in array T */
type TRecursionArray<T extends Array<any>, S extends IASTBase> = T extends Array<infer P>
    ? Array<TIsRecursiveNode<P, TMakeASTRecursive<S>, P>>
    : never;

/**
 * Checks whether a given node is a recursive node, and if so returns T, otherwise returns F
 */
export type TIsRecursiveNode<N, T, F> = N extends IASTRecursive
    ? IASTRecursive extends N
        ? T
        : F
    : F;
