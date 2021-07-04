type ImmutablePrimitive = undefined | null | boolean | string | number | Function;

// Source: https://stackoverflow.com/a/58993872/8521718

export type IImmutable<T> = T extends ImmutablePrimitive
    ? T
    : T extends Array<infer U>
    ? IImmutableArray<U>
    : T extends Map<infer K, infer V>
    ? IImmutableMap<K, V>
    : T extends Set<infer M>
    ? IImmutableSet<M>
    : IImmutableObject<T>;

export type IImmutableArray<T> = ReadonlyArray<IImmutable<T>>;
export type IImmutableMap<K, V> = ReadonlyMap<IImmutable<K>, IImmutable<V>>;
export type IImmutableSet<T> = ReadonlySet<IImmutable<T>>;
export type IImmutableObject<T> = {readonly [K in keyof T]: IImmutable<T[K]>};
