import {IBaseError} from "../_types/errors/IBaseError";
import {IErrorObject} from "../_types/IErrorObject";
import {ErrorSymbol} from "./createErrorsObject";

/**
 * Checks whether a given object is an error object
 * @param data The data to be checked
 * @returns Whether the data is an error
 */
export function isError<T extends IBaseError>(
    data: Object | IErrorObject<T>
): data is IErrorObject<T> {
    return "type" in data && data.type == ErrorSymbol;
}
