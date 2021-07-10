const RecursiveResult = Symbol("shit");

/** A type to specify this property is the recursively obtained result of the expression */
export type IRecursiveResult = typeof RecursiveResult;

/** Indicates that a given node type is recursively reduced */
export type IRecursive<T> = {node: T; [RecursiveResult]: true};
