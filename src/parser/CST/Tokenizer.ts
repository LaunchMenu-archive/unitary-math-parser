import {IToken, Lexer} from "chevrotain";
import {IUnknownCharacterError} from "../../_types/errors/IUnknownCharacterError";
import {IParserConfig} from "../../_types/IParserConfig";
import {getSyntaxPointerMessage} from "../getSyntaxPointerMessage";
import {resolveTokenTypes} from "./CSTParser";

export class Tokenizer {
    /** The lexer to tokenize the input */
    protected lexer: Lexer;

    /**
     * Creates a tokenizer for a given string input
     * @param config The configuration of the parser
     */
    public constructor(config: IParserConfig) {
        this.lexer = new Lexer(resolveTokenTypes(config));
    }

    /**
     * Tokenizes the given text
     * @param text The text to tokenize
     * @returns The result or parsing error
     */
    public tokenize(text: string): {tokens: IToken[]; errors: IUnknownCharacterError[]} {
        const {tokens, errors} = this.lexer.tokenize(text);
        return {
            tokens,
            errors: errors.map(error => {
                const char = text[error.offset];
                return {
                    type: "unknownCharacter",
                    index: error.offset,
                    character: char,
                    message: `Unexpected character found at index ${error.offset}: ${char}`,
                    multilineMessage: `Unexpected character "${char}" found:\n${getSyntaxPointerMessage(
                        text,
                        error.offset
                    )}`,
                };
            }),
        };
    }
}
