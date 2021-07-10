import {IASTBase} from "./IASTBase";
import {IRecursive} from "./IRecursive";
import {TIsRecursiveNode} from "./TMakeASTRecursive";

/**
 * Obtain the plain node for a given AST node, with all recursion data extracted
 * @param T The node to be converted
 */
export type TGetPlainAST<T extends IASTBase> = T extends infer U
    ? TIsRecursiveNode<
          U,
          U,
          U extends IASTBase<infer N, infer C>
              ? IASTBase<
                    N,
                    C extends object
                        ? {
                              [K in keyof C]: TRecursiveMap<C[K]>;
                          }
                        : unknown
                >
              : never
      >
    : never;

type TRecursiveMap<T> = T extends IASTBase
    ? TGetPlainAST<T>
    : T extends IRecursive<infer N>
    ? TRecursiveMap<N>
    : T extends Array<any>
    ? TMapArray<T>
    : T extends object
    ? TMapObject<T>
    : T;

type TMapArray<T extends Array<any>> = T extends [infer F, ...infer R]
    ? [TRecursiveMap<F>, ...TMapArray<R>]
    : TMapNonTupleArray<T>;

type TMapNonTupleArray<T extends Array<any>> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<TRecursiveMap<U>>
    : T;

type TMapObject<O extends object> = {
    [K in keyof O]: TRecursiveMap<O[K]>;
};
