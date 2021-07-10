/**
 * Maps both tuples and proper arrays
 */
export type TMapArray<T extends Array<any>, S, V> = T extends [infer F, ...infer R]
    ? [F] extends [S]
        ? [V, ...TMapArray<R, S, V>]
        : [F, ...TMapArray<R, S, V>]
    : TMapNonTupleArray<T, S, V>;

type TMapNonTupleArray<T extends Array<any>, S, V> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<U extends S ? V : U>
    : T;
