import {ErrorSymbol} from "../parser/createErrorsObject";
import {IBaseError} from "./errors/IBaseError";

/** An object ot hold multiple errors */
export type IErrorObject<T extends IBaseError> = {
    /** An indicator that this object represents na error */
    type: typeof ErrorSymbol;
    /** The error collection */
    errors: T[];
};
