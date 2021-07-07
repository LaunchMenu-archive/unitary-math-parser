import {TokenType} from "chevrotain";

/** An error that represents having finished parsing without having finished all rules */
export type IUnexpectedEOFError = {
    /** The type of error */
    type: "unexpectedEOF";
    /** The human readable error message */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
    /** The token that was expected */
    expected: TokenType;
};
