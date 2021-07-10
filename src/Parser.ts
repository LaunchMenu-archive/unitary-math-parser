import {IToken} from "chevrotain";
import {createASTParser} from "./parser/AST/createASTParser";
import {CSTParser} from "./parser/CST/CSTParser";
import {Tokenizer} from "./parser/CST/Tokenizer";
import {IParseOutput} from "./parser/_types/IParseOutput";
import {ITokenizerResult} from "./parser/_types/ITokenizerResult";
import {TGetSyntaxASTType} from "./_types/AST/TGetSyntaxASTType";
import {TMakeASTRecursive} from "./_types/AST/TMakeASTRecursive";
import {ICST} from "./_types/CST/ICST";
import {ICSTLeaf} from "./_types/CST/ICSTLeaf";
import {ICSTParsingError, IParsingError} from "./_types/errors/IParsingError";
import {IUnknownCharacterError} from "./_types/errors/IUnknownCharacterError";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IParserConfig} from "./_types/IParserConfig";
import {IParsingResult} from "./_types/IParsingResult";
import {TGetAllFeatures} from "./_types/TGetAllFeatures";
import {TGetConfigOutputAST} from "./_types/AST/TGetConfigOutputAST";
import {TGetParserConfigSyntax} from "./_types/TGetParserConfigSyntax";
import {TGetConfigReachableAST} from "./_types/AST/TGetConfigReachableFeatureSyntax";
import {TGetReductionASTNode} from "./_types/AST/TGetReductionASTNode";
import {ASTParser} from "./parser/AST/ASTParser";
import {isLeaf} from "./parser/CST/isLeaf";
import {IASTResult} from "./_types/AST/IASTResult";

export class Parser<C extends IParserConfig> {
    protected config: C;

    /** The tokenizer of the input */
    protected tokenizer: Tokenizer;

    /** The CST parser */
    protected cstParser: CSTParser;

    /** The AST parser */
    protected astParser: ASTParser<C>;

    /**
     * Creates a new parser according to the given config
     * @param config The configuration for the parser
     */
    public constructor(config: C) {
        this.config = config;

        this.tokenizer = new Tokenizer(config);
        this.cstParser = new CSTParser(config);
        this.astParser = new ASTParser(config);
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

        const result = this.createParseReturn(tokens, CST);
        Object.defineProperty(result, "correctionAlternatives", {
            get: () => {},
        });
        return result as IParseOutput<C, typeof ignoreTokenizationErrors>;
    }

    /**
     * Creates the return for the parse function
     * @param CST The CST to return the result for
     * @returns The parsing result
     */
    protected createParseReturn(
        tokens: ITokenizerResult,
        CST: ICST
    ): Omit<IParsingResult<C>, "correctionAlternatives"> {
        const AST = createCached<IASTResult<C>>(() => {
            const ast = this.getAST(CST);
            return {
                tree: ast,
                reduce: step => this.reduceAST(step, ast),
            };
        });

        return {
            tokenization: {
                tokens: tokens.tokens,
                errors: tokens.errors,
            },
            cst: {
                tree: CST,
                reduce: (base, step) => this.reduceCST(base, step, CST),
            },
            get containsCorrection() {
                return false;
            },
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
    public getTokens(input: string): ITokenizerResult {
        return this.tokenizer.tokenize(input);
    }

    /**
     * Retrieves the concrete syntax tree for a given string input
     * @param tokens The tokens to create a CST from
     * @param input The input to retrieve a CST for
     * @returns The CST or parsing errors
     */
    public getCST(tokens: IToken[], input: string): ICST | {errors: ICSTParsingError[]} {
        return this.cstParser.parse(tokens, input);
    }

    /**
     * Walks a tree and reduces it to some result
     * @param base The base case for the tree walk
     * @param step The step case for the tree walk
     * @param tree The tree to be reduced
     * @returns The result of the reduction
     */
    public reduceCST<O>(
        base: {
            /**
             * Returns the result for a given leaf
             * @param leaf The leaf that was found
             * @returns The result for the leaf
             */
            (leaf: ICSTLeaf): O;
        },
        step: {
            /**
             * Returns the result for a given node
             * @param type The type of the node that was found
             * @param children The results of the children of the node
             * @returns The result for this node
             */
            (type: string, children: O[]): O;
        },
        tree: ICST
    ): O {
        return this.cstParser.reduce(base, step, tree);
    }

    /**
     * Retrieves an AST (abstract syntax tree) given a CST (concrete syntax tree), if the CST only uses features as specified in this parser's config
     * @param tree The tree to convert to AST
     * @returns The AST that was created
     */
    public getAST(tree: ICST): TGetConfigOutputAST<C> {
        if (isLeaf(tree)) throw Error("Can't create an AST from a leaf CST node");
        return this.astParser.createAST(tree);
    }

    /**
     * Walks a tree and reduces it to some result
     * @param step The step case for the tree walk
     * @param tree The tree to be reduced
     * @returns The result of the reduction
     */
    public reduceAST<O>(
        step: (node: TGetReductionASTNode<TGetConfigReachableAST<C>, O>) => O,
        tree: TGetConfigOutputAST<C>
    ): O {
        return this.astParser.reduce(step, tree);
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
