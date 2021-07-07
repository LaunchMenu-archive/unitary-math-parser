import {IToken, TokenType} from "chevrotain";

/** An error that represents finding an unexpected token */
export type IUnexpectedTokenError = {
    /** The type of error */
    type: "unexpectedToken";
    /** The human readable error message */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
    /** The token that was found */
    token: IToken;
    /** The token that was expected */
    expected: TokenType;
};
