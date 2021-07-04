import {createToken, Lexer} from "chevrotain";

export const numberToken = createToken({name: "Number", pattern: /(\d*\.)?\d+/});
export const leftBracketToken = createToken({name: "Left Bracket", pattern: /\(/});
export const rightBracketToken = createToken({name: "Right Bracket", pattern: /\)/});

export const addToken = createToken({name: "Add", pattern: /\+/});
export const subtractToken = createToken({name: "Subtract", pattern: /\-/});
export const multiplyToken = createToken({name: "Multiply", pattern: /\*/});
export const divideToken = createToken({name: "Divide", pattern: /\//});
export const powerToken = createToken({name: "Power", pattern: /\^/});
export const percentToken = createToken({name: "Percent", pattern: /\%/});
export const factorialToken = createToken({name: "Factorial", pattern: /\!/});

export const functionNameToken = createToken({
    name: "Function name",
    pattern: /[a-zA-Z_]\w+/,
});
export const parameterSeparatorToken = createToken({
    name: "Parameter Separator",
    pattern: /\,/,
});

export const whiteSpaceToken = createToken({
    name: "White Space",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
});

export const tokens = [
    numberToken,
    leftBracketToken,
    rightBracketToken,
    addToken,
    subtractToken,
    multiplyToken,
    divideToken,
    powerToken,
    percentToken,
    factorialToken,
    functionNameToken,
    parameterSeparatorToken,
    whiteSpaceToken,
];
