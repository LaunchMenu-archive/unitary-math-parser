import {createToken, Lexer} from "chevrotain";

/** The space token that's skipped and not part of the grammar */
export const spaceToken = createToken({
    name: "SPACE",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
});
