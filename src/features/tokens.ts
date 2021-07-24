import {Lexer} from "chevrotain";
import {createToken} from "../createToken";

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
export const dotToken = createToken({
    name: "DOT",
    pattern: /\./,
    label: '"."',
});

// Text types
export const numberFormatToken = createToken({
    name: "FORMATTED-NUMBER",
    pattern: /(\w*\.)?\w+(e\-\w+)? as/i,
    label: "formatted-number",
});
export const textToken = createToken({
    name: "TEXT",
    pattern: /(\w|%)+/,
    label: "text",
    longer_alt: numberFormatToken,
});
export const numberToken = createToken({
    name: "NUMBER",
    pattern: /(\d*\.)?\d+/,
    label: "number",
    longer_alt: numberFormatToken,
});
// TODO: add a way of inserting this before the number token
export const binaryNumberToken = createToken({
    name: "BINARY",
    pattern: /0b([0-1]*\.)?[0-1]+(e\-?[0-1]+)?/i,
    label: "binary-number",
    before: [numberToken],
});
export const octalNumberToken = createToken({
    name: "OCTAL",
    pattern: /0o([0-7]*\.)?[0-7]+(e\-?[0-7]+)?/i,
    label: "octal-number",
    before: [numberToken],
});
export const hexNumberToken = createToken({
    name: "HEXADECIMAL",
    pattern: /0x([0-9a-f]*\.)?[0-9a-f]+/i,
    label: "hex-number",
    before: [numberToken],
});

// Keywords
export const conversionToken = createToken({
    name: "IN",
    pattern: /in/i,
    label: '"in"',
    longer_alt: textToken,
});
export const moduloToken = createToken({
    name: "MOD",
    pattern: /mod/i,
    label: "mod",
    longer_alt: textToken,
});
export const formatToken = createToken({
    name: "AS",
    pattern: /as/i,
    label: '"as"',
    longer_alt: textToken,
});
