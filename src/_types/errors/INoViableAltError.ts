import {IToken, TokenType} from "chevrotain";

/** An error that represents not being able to find a matching sequence from an `or` */
export type INoViableAltError = {
    /** The type of error */
    type: "noViableAlt";
    /** The human readable error message */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
    /** The token that was found */
    token: IToken;
    /** The possible different prefix sequences that are accepted */
    suggestions: TokenType[][];
};
