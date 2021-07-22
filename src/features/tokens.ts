import {createToken, Lexer} from "chevrotain";

/** The space token that's skipped and not part of the grammar */
export const spaceToken = createToken({
    name: "SPACE",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
});

// symbols
export const addToken = createToken({name: "ADD", pattern: /\+/, label: '"+"'});
export const subtractToken = createToken({name: "SUBTRACT", pattern: /\-/, label: '"-"'});
export const multiplyToken = createToken({name: "MULTIPLY", pattern: /\*/, label: '"*"'});
export const divideToken = createToken({name: "DIVIDE", pattern: /\//, label: '"/"'});
export const unitToken = createToken({
    name: "UNIT",
    pattern: /#/,
    label: '"#"',
});
export const variableToken = createToken({
    name: "VAR",
    pattern: /\$/,
    label: '"$"',
});
export const powerToken = createToken({
    name: "POWER",
    pattern: /\^/,
    label: '"^"',
});
export const leftBracketToken = createToken({
    name: "LEFT-BRACKET",
    pattern: /\(/,
    label: '"("',
});
export const rightBracketToken = createToken({
    name: "RIGHT-BRACKET",
    pattern: /\)/,
    label: '")"',
});
export const factorialToken = createToken({
    name: "FACTORIAL",
    pattern: /\!/,
    label: '"!"',
});

// Text types
export const numberToken = createToken({
    name: "NUMBER",
    pattern: /(\d*\.)?\d+/,
    label: "number",
});
export const textToken = createToken({
    name: "TEXT",
    pattern: /(\w|%)+/,
    label: "text",
});

// Keywords
export const unitConversionToken = createToken({
    name: "IN",
    pattern: /in/i,
    label: '"in"',
    longer_alt: textToken,
});
export const moduloToken = createToken({
    name: "MOD",
    pattern: /mod/,
    label: "mod",
    longer_alt: textToken,
});
