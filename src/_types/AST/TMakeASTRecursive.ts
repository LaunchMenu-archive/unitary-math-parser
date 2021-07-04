import {IASTBase} from "./IASTBase";
import {IASTRecursive} from "./IASTRecursive";

// /**
//  * Replaces occurrences of the recursive node type by the actual recursive type
//  */
export type TMakeASTRecursive<
    T extends IASTBase<string>,
    S extends IASTBase<string> = T
> = T extends infer A ? (A extends IASTBase ? TRecursionObject<A, S> : never) : never;

/** Replaces all recursive AST nodes by S in T */
type TRecursionObject<T extends object, S extends IASTBase> = {
    [K in keyof T]: T[K] extends Array<any>
        ? TRecursionArray<T[K], S>
        : T[K] extends IASTRecursive
        ? IASTRecursive extends T[K]
            ? TMakeASTRecursive<S>
            : T[K]
        : T[K];
};

type TRecursionArray<T extends Array<any>, S extends IASTBase> = T extends Array<infer P>
    ? P extends IASTRecursive
        ? IASTRecursive extends P
            ? Array<TMakeASTRecursive<S>>
            : Array<P>
        : Array<P>
    : never;
