import {IEarlyExitError} from "./IEarlyExitError";
import {INotAllInputParsedError} from "./INotAllInputParsedError";
import {INoViableAltError} from "./INoViableAltError";
import {IUnexpectedEOFError} from "./IUnexpectedEOFError";
import {IUnexpectedTokenError} from "./IUnexpectedTokenError";
import {IUnknownCharacterError} from "./IUnknownCharacterError";

/** All possible parsing errors */
export type IParsingError = ICSTParsingError | IUnknownCharacterError;

export type ICSTParsingError =
    | IUnexpectedEOFError
    | IUnexpectedTokenError
    | INoViableAltError
    | IEarlyExitError
    | INotAllInputParsedError;
