import {IToken} from "chevrotain";

/** An error that represents not all input having been parsed */
export type INotAllInputParsedError = {
    /** The type of error */
    type: "notAllInputParsed";
    /** The human readable error message */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
    /** The token that was found */
    token: IToken;
};
