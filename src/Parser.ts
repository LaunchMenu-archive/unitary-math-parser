import {IToken} from "chevrotain";
import {CSTParser} from "./parser/CST/CSTParser";
import {Tokenizer} from "./parser/CST/Tokenizer";
import {IParseOutput} from "./parser/_types/IParseOutput";
import {ITokenizerResult} from "./parser/_types/ITokenizerResult";
import {ICST} from "./_types/CST/ICST";
import {ICSTLeaf} from "./_types/CST/ICSTLeaf";
import {ICSTParsingError} from "./_types/errors/IParsingError";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IParserConfig} from "./_types/IParserConfig";
import {IParsingResult} from "./_types/IParsingResult";
import {TGetConfigOutputAST} from "./_types/AST/TGetConfigOutputAST";
import {TGetConfigReachableAST} from "./_types/AST/TGetConfigReachableFeatureSyntax";
import {TGetReductionASTNode} from "./_types/AST/TGetReductionASTNode";
import {ASTParser} from "./parser/AST/ASTParser";
import {isLeaf} from "./parser/CST/isLeaf";
import {IASTResult} from "./_types/AST/IASTResult";
import {ICSTNode} from "./_types/CST/ICSTNode";
import {IAlternativeCSTValidation} from "./_types/CST/IAlternativeCSTValidation";
import {createErrorObject} from "./parser/createErrorsObject";
import {IErrorObject} from "./_types/IErrorObject";
import {EvaluationContext} from "./parser/AST/EvaluationContext";
import {IValue} from "./parser/dataTypes/_types/IValue";

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
     * Evaluates the given expression
     * @param expression The expression to be evaluated
     * @param context The context to pass variables in, etc.
     * @returns The result of the evaluation, or errors if evaluation failed
     */
    public evaluate(
        expression: string,
        context: EvaluationContext = new EvaluationContext()
    ): IErrorObject<any> | IValue {
        const result = this.parse(expression);
        if ("errors" in result) return result;
        return result.evaluate(context);
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
            return createErrorObject(tokens.errors);

        const CST = this.getCST(tokens.tokens, input);
        if ("errors" in CST) return CST;

        const result = this.createParseReturn(input, tokens, CST);

        // Add alternatives to output
        const This = this;
        Object.defineProperty(result, "getCorrectionAlternatives", {
            value: function* (
                validations: IAlternativeCSTValidation<IFeatureSyntax>[] = []
            ) {
                for (let alt of This.getCSTAlternatives(CST, validations)) {
                    yield This.createParseReturn(input, tokens, alt);
                }
            },
        });

        // Return the overall result
        return result as IParseOutput<C, typeof ignoreTokenizationErrors>;
    }

    /**
     * Creates the return for the parse function
     * @param expression The expression that the data was extracted from
     * @param tokens The tokenized expression
     * @param CST The CST of the expression
     * @returns The parsing result
     */
    protected createParseReturn(
        expression: string,
        tokens: ITokenizerResult,
        CST: ICSTNode
    ): Omit<IParsingResult<C>, "getCorrectionAlternatives"> {
        const AST = createCached<IASTResult<C>>(() => {
            const ast = this.getAST(CST);
            return {
                tree: ast,
                reduce: step => this.reduceAST(step, ast),
            };
        });
        const containsCorrect = createCached(() => this.containsCorrection(CST));

        return {
            tokenization: {
                tokens: tokens.tokens,
                errors: tokens.errors,
            },
            cst: {
                tree: CST,
                reduce: (base, step) => this.reduceCST(base, step, CST),
                toString: () => this.getCSTString(CST).text,
            },
            get containsCorrection() {
                return containsCorrect();
            },
            get ast() {
                return AST();
            },
            evaluate: context => this.evaluateAST(AST().tree, expression, context),
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
    public getCST(
        tokens: IToken[],
        input: string
    ): ICSTNode | IErrorObject<ICSTParsingError> {
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
     * Checks whether a given tree contains an automatic correction
     * @param CST The CST to check
     * @returns Whether the CST contains an error correction
     */
    public containsCorrection(CST: ICSTNode): boolean {
        return this.reduceCST(
            node => node.isRecovery ?? false,
            (t, children) => children.some(isRecovery => isRecovery),
            CST
        );
    }

    /**
     * Computes alternative CSTs for a given tree, assuming the tree contained auto corrections
     * @param CST The CST tree to compute alternatives for
     * @param validations Validations to skip some of the trees in the output
     * @returns The generator for different CST options
     */
    public getCSTAlternatives(
        CST: ICSTNode,
        validations: IAlternativeCSTValidation<IFeatureSyntax>[] = []
    ): Generator<ICSTNode> {
        return this.cstParser.computeAlternatives(CST, validations);
    }

    /**
     * Retrieves the string representation of a given CST
     * @param CST The CST to get the string notation for
     * @returns The string notation
     */
    public getCSTString(CST: ICST): {
        text: string;
        start: number | undefined;
        end: number | undefined;
    } {
        if (isLeaf(CST))
            return {
                text: CST.text,
                start: CST.isRecovery ? undefined : CST.range.start,
                end: CST.isRecovery ? undefined : CST.range.end,
            };

        return CST.children.reduce(
            ({text, start, end}, child) => {
                const childData = this.getCSTString(child);
                const skippedChars =
                    end !== undefined &&
                    childData.start != undefined &&
                    childData.start - end > 0;
                return {
                    text: text + (skippedChars ? " " : "") + childData.text,
                    start:
                        start != undefined && childData.start != undefined
                            ? Math.min(childData.start, start)
                            : childData.start ?? start,
                    end:
                        end != undefined && childData.end != undefined
                            ? Math.max(end, childData.end)
                            : childData.end ?? end,
                };
            },
            {
                text: "",
                start: undefined as undefined | number,
                end: undefined as undefined | number,
            }
        );
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

    /**
     * Evaluates a given tree to obtain its result
     * @param tree The tree to be evaluated
     * @param expression The text of the expression (which was transformed into the tree) used for error message creation
     * @param context The contextual data that nodes can use during evaluation
     * @returns The obtained value
     */
    public evaluateAST(
        tree: TGetConfigOutputAST<C>,
        expression: string,
        context: EvaluationContext = new EvaluationContext()
    ): IErrorObject<any> | IValue {
        return this.astParser.evaluate(tree, context, expression);
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
