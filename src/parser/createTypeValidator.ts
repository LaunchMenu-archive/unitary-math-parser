import {ITypeValidator} from "../_types/evaluation/ITypeValidator";

/**
 * Creates a type validator
 * @param name The name of the validator
 * @param check The validator itself
 * @returns The created validator
 */
export function createTypeValidator<T extends object>(
    name: string,
    check: (value: object | T) => value is T
): ITypeValidator<T> {
    const validator = (value: object) => check(value);
    validator.typeName = name;
    return validator as any;
}
