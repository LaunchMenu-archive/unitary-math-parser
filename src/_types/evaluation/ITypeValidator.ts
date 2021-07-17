/** A type to check whether the result type of an expression is the specified type */
export type ITypeValidator<T extends object = any> = {
    /** The name of the type that was expected */
    typeName: string;
    /** Checks whether the passed value is of the type */
    (value: object): value is T;
};
