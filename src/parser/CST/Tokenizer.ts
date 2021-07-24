import {IToken, Lexer, TokenType} from "chevrotain";
import {IUnknownCharacterError} from "../../_types/errors/IUnknownCharacterError";
import {IParserConfig} from "../../_types/IParserConfig";
import {getSyntaxPointerMessage} from "../getSyntaxPointerMessage";
import {ITokenizerResult} from "../_types/ITokenizerResult";
import {resolveTokenTypes} from "./CSTParserBase";

export class Tokenizer {
    /** The lexer to tokenize the input */
    protected lexer: Lexer;
    protected tokenTypes: TokenType[];
    protected missingAltTokenTypes: TokenType[];

    /**
     * Creates a tokenizer for a given string input
     * @param config The configuration of the parser
     */
    public constructor(config: IParserConfig) {
        this.tokenTypes = resolveTokenTypes(config);

        // Remove the `alt` property if alt isn't present in token set
        this.missingAltTokenTypes = this.tokenTypes.filter(
            t => t.LONGER_ALT && !this.tokenTypes.includes(t.LONGER_ALT)
        );
        this.missingAltTokenTypes.forEach(
            (t: TokenType & {LONGER_ALT_BU?: TokenType}) => {
                t.LONGER_ALT_BU = t.LONGER_ALT;
                delete t.LONGER_ALT;
            }
        );

        this.lexer = new Lexer(this.tokenTypes);

        // Restore removed `alt` properties
        this.missingAltTokenTypes.forEach(
            (t: TokenType & {LONGER_ALT_BU?: TokenType}) => {
                t.LONGER_ALT = t.LONGER_ALT_BU;
            }
        );
    }

    /**
     * Tokenizes the given text
     * @param text The text to tokenize
     * @returns The result or parsing error
     */
    public tokenize(text: string): ITokenizerResult {
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
