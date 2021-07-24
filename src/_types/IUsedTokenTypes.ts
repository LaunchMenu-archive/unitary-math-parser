import {TokenType} from "chevrotain";

export type IUsedTokenTypes = (TokenType & {
    /** The token that this token should proceed in the list */
    before?: TokenType[];
})[];
