import {IBaseError} from "../_types/errors/IBaseError";
import {IErrorObject} from "../_types/IErrorObject";

export const ErrorSymbol = Symbol("error");

/**
 * Creates an object to hold the passed errors
 * @param errors The errors to store
 * @returns The object
 */
export function createErrorObject<T extends IBaseError>(errors: T[]): IErrorObject<T> {
    return {
        type: ErrorSymbol,
        errors,
    };
}
