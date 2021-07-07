import {IToken} from "chevrotain";
import {createASTParser} from "./parser/AST/createASTParser";
import {CSTParser} from "./parser/CST/CSTParser";
import {Tokenizer} from "./parser/CST/Tokenizer";
import {IParseOutput} from "./parser/_types/IParseOutput";
import {TGetSyntaxASTType} from "./_types/AST/TGetSyntaxASTType";
import {TMakeASTRecursive} from "./_types/AST/TMakeASTRecursive";
import {ICST} from "./_types/CST/ICST";
import {ICSTParsingError, IParsingError} from "./_types/errors/IParsingError";
import {IUnknownCharacterError} from "./_types/errors/IUnknownCharacterError";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IParserConfig} from "./_types/IParserConfig";
import {IParsingResult} from "./_types/IParsingResult";

export class Parser<C extends IParserConfig<T>, T extends IFeatureSyntax> {
    protected config: C;

    /** The tokenizer of the input */
    protected tokenizer: Tokenizer;

    /** The CST parser */
    protected parser: CSTParser;

    /** The AST parser */
    protected parseAST: {(tree: ICST): TMakeASTRecursive<TGetSyntaxASTType<T>>};

    /**
     * Creates a new parser according to the given config
     * @param config The configuration for the parser
     */
    public constructor(config: C) {
        this.config = config;

        this.tokenizer = new Tokenizer(config);
        this.parser = new CSTParser(config);
        this.parseAST = createASTParser(config);
    }

    /**
     * Parses a given input string, and retrieves getters for all data relating to it
     * @param input The input string to be parsed
     * @param ignoreTokenizationErrors Whether to still compute the CST if unexpected characters are found
     * @returns An object with all getters for the data related to it
     */
    public parse(
        input: string,
        ignoreTokenizationErrors: boolean = false
    ): IParseOutput<C, typeof ignoreTokenizationErrors> {
        const tokens = this.getTokens(input);
        if (!ignoreTokenizationErrors && tokens.errors.length > 0)
            return {errors: tokens.errors};

        const CST = this.getCST(tokens.tokens, input);
        if ("errors" in CST) return CST;

        const AST = createCached(() => this.getAST(CST));

        return {
            tokens: tokens.tokens,
            tokenErrors: tokens.errors,
            cst: CST,
            get ast() {
                return AST();
            },
        };
    }

    /**
     * Retrieves the tokens for a given input
     * @param input The string to get the tokens for
     * @returns The tokens as well as the errors
     */
    public getTokens(input: string): {
        tokens: IToken[];
        errors: IUnknownCharacterError[];
    } {
        return this.tokenizer.tokenize(input);
    }

    /**
     * Retrieves the concrete syntax tree for a given string input
     * @param tokens The tokens to create a CST from
     * @param input The input to retrieve a CST for
     * @returns The CST or parsing errors
     */
    public getCST(tokens: IToken[], input: string): ICST | {errors: ICSTParsingError[]} {
        return this.parser.parse(tokens, input);
    }

    /**
     * Retrieves an AST (abstract syntax tree) given a CST (concrete syntax tree), if the CST only uses features as specified in this parser's config
     * @param tree The tree to convert to AST
     * @returns The AST that was created
     */
    public getAST(tree: ICST): TMakeASTRecursive<TGetSyntaxASTType<T>> {
        return this.parseAST(tree);
    }
}

/**
 * Creates a getter that caches the result
 * @param getter The nullary getter whose result to be cached
 * @returns The getter that retrieves the function
 */
function createCached<T>(getter: () => T): () => T {
    let cached: {result: T} | undefined;
    return () => {
        if (!cached) cached = {result: getter()};
        return cached.result;
    };
}
