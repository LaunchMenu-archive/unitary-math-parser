import {
    EmbeddedActionsParser,
    isRecognitionException,
    IToken,
    Lexer,
    SubruleMethodOpts,
    TokenType,
} from "chevrotain";
import {IBaseFeature} from "../../_types/IBaseFeature";
import {IFeature} from "../../_types/IFeature";
import {IFeaturePrecedenceTarget} from "../../_types/IFeatureParser";
import {IFeatureSupport} from "../../_types/IFeatureSupport";
import {IParserConfig} from "../../_types/IParserConfig";
import {IUsedTokenTypes} from "../../_types/IUsedTokenTypes";
import {ICST} from "../../_types/CST/ICST";
import {IFeatureRuleData} from "../../_types/CST/IFeatureRuleData";
import {ISupportable} from "../_types/ISupportable";
import {getFeatureSupports} from "../getFeatureSupports";
import {createCSTNodeCreator} from "./createCSTNodeCreator";
import {IRuleData} from "../../_types/CST/IRuleData";
import {createCSTLeaf} from "./createCSTLeaf";
import {ICSTParseInit} from "../../_types/CST/ICSTParseInit";
import {ICSTDataIdentifier} from "../_types/ICSTDataIdentifier";

let tokenList: TokenType[];
export class CSTParser extends EmbeddedActionsParser {
    /** The configuration of the parser */
    protected config: IParserConfig;
    protected inits: ICSTParseInit[];

    /** The rules for the different precedence levels */
    protected precedenceRules: {
        features: {prefix: IFeature[]; suffix: IFeature[]};
        rule: (idxInCallingRule?: number | undefined, ...args: any[]) => ICST;
    }[];

    /** The support rules */
    protected supportRules: Map<string, (idx: number) => ICST> = new Map();

    /** The lexer to tokenize the input */
    protected lexer: Lexer;

    /** Additional data that rules can use to keep track of things */
    protected trackingData: Record<symbol, any> = {};

    /**
     * Creates a new parser
     * @param config The configuration for the parser
     */
    public constructor(config: IParserConfig) {
        super((tokenList = resolveTokenTypes(config)));

        this.config = config;
        this.lexer = new Lexer(tokenList);
        this.createStaticStructure();

        this.performSelfAnalysis();
    }

    /**
     * Parses the given text input
     * @param text The text to be parsed
     * @returns Th concrete syntax tree
     */
    public parse(text: string): ICST {
        // Tokenize
        this.trackingData = {};
        const {tokens, errors} = this.lexer.tokenize(text);

        // Init parser
        const initData = {parser: this as any, tokens, input: text};
        const finalTokens = this.inits.reduce((current, {init}) => {
            const newTokens = init?.(current);
            return newTokens ? {...current, tokens: newTokens} : current;
        }, initData).tokens;

        this.input = finalTokens;

        // Parse
        const result = this.expression();
        console.log([...this.errors, ...errors]);
        console.log(result);
        debugger;
        return result;
    }

    /**
     * Converts the parser config the the proper parser structure
     */
    protected createStaticStructure() {
        // Get all initializables
        const featureSupports = getFeatureSupports(this.config);
        this.inits = [
            ...this.config.baseFeatures,
            ...this.config.features,
            ...featureSupports,
        ]
            .map(({parse}) => parse.init)
            .filter(init => init)
            .map(init => ({init}));

        // Extract the supporting rules
        featureSupports.forEach(({id, name, parse: {exec}}, i) => {
            const supportRuleData: IRuleData = {
                parser: this as any,
                createLeaf: createCSTLeaf,
                createNode: () => createCSTNodeCreator(name),
            };

            return this.supportRules.set(
                id,
                this.RULE(`${name}-${i}`, () => exec(supportRuleData))
            );
        });

        // Setup the base rules (highest precedence)
        const baseRules = this.config.baseFeatures.map(({name, parse: {exec}}, i) => {
            const baseRuleData: Omit<IFeatureRuleData, "currentRule"> = {
                parser: this as any,
                nextRule: this.expression,
                createLeaf: createCSTLeaf,
                createNode: () => createCSTNodeCreator(name),
            };
            return this.RULE(`${name}-base-${i}`, () =>
                (exec as any)({...baseRuleData, currentRule: this.base})
            );
        });
        this.base = this.RULE("base", () =>
            this.OR<ICST>(
                baseRules.map((exec, i) => ({
                    ALT: () => this.subrule(i, exec),
                }))
            )
        );

        // Setup the recursive precedence rules
        const layers = this.getPrecedenceLayers(
            this.config.features,
            this.config.baseFeatures
        );
        const rules: ((idxInCallingRule?: number | undefined, ...args: any[]) => ICST)[] =
            [];
        this.precedenceRules = layers.map(({prefix, suffix}, index) => {
            const nextRule = index > 0 ? rules[index - 1] : this.base;

            // Create the prefix rule if there are prefixes
            let prefixRule: (() => ICST) | undefined;
            if (prefix.length > 0) {
                const prefixOptionRules = prefix.map(({name, parse: {exec}}, i) => {
                    const prefixRuleData: Omit<IFeatureRuleData, "currentRule"> = {
                        parser: this as any,
                        nextRule,
                        createLeaf: createCSTLeaf,
                        createNode: () => createCSTNodeCreator(name),
                    };

                    return this.RULE(`p${index}-prefix-${name}-${i}`, () =>
                        (exec as any)({...prefixRuleData, currentRule: prefixRule})
                    );
                });
                const fallThrough = {
                    ALT: () => this.subrule(prefixOptionRules.length, nextRule),
                };
                const shouldFallThrough = !prefix.some(
                    ({parse: {type}}) => type == "prefixBase"
                );
                prefixRule = this.RULE(`p${index}-prefix`, () => {
                    const options = prefixOptionRules.map((rule, i) => ({
                        ALT: () => this.subrule(i, rule),
                    }));
                    return this.OR(
                        shouldFallThrough ? [...options, fallThrough] : options
                    );
                });

                if (suffix.length == 0) {
                    // Return the precedence rules data
                    rules.push(prefixRule);
                    return {
                        features: {prefix, suffix},
                        rule: prefixRule,
                    };
                }
            }

            // Create the suffix rule
            const suffixOptionRules = suffix.map(({name, parse: {exec}}, i) => {
                const suffixRuleData: Omit<IFeatureRuleData, "currentRule"> = {
                    parser: this as any,
                    nextRule: prefixRule ?? nextRule,
                    createLeaf: createCSTLeaf,
                    createNode: () => createCSTNodeCreator(name),
                };

                return this.RULE(`p${index}-suffix-${name}-${i}`, node =>
                    (exec as any)(node, {...suffixRuleData, currentRule: suffixRule})
                );
            });
            const suffixRule = this.RULE(`p${index}-suffix`, () => {
                let node: ICST = this.SUBRULE(prefixRule ?? nextRule);

                const options = suffixOptionRules.map((rule, i) => ({
                    ALT: () => (node = this.subrule(i, rule, {ARGS: [node]})),
                }));
                this.MANY(() => {
                    this.OR(options);
                });
                return node;
            });

            // Return the precedence rules data
            rules.push(suffixRule);
            return {
                features: {prefix, suffix},
                rule: suffixRule,
            };
        });
    }

    /**
     * Retrieves the separate precedence layers given a flat feature list
     * @param features The list of features to layer
     * @param baseFeatures The base features that can be used to specify precedence
     * @returns THe features arranged in several layers
     */
    protected getPrecedenceLayers(
        features: IFeature[],
        baseFeatures: IBaseFeature[]
    ): {prefix: IFeature[]; suffix: IFeature[]}[] {
        // Sort the features such that no feature references one that comes after it
        const processingTag = Symbol();
        const processedTag = Symbol();
        function recursiveCreateFeatureOrder(
            features: (IFeature & {[processedTag]?: boolean; [processingTag]?: boolean})[]
        ): IFeature[] {
            return features.flatMap<IFeature>(feature => {
                if (processedTag in feature) return [];
                if (processingTag in feature)
                    throw Error(
                        `There is a precedence dependency cycle involving "${feature.name}"`
                    );

                feature[processedTag] = true;
                try {
                    const {precedence} = feature.parse;
                    const dependency =
                        "lowerThan" in precedence
                            ? precedence.lowerThan
                            : precedence.sameAs;

                    if (isFeature(dependency))
                        return [...recursiveCreateFeatureOrder([dependency]), feature];
                    return [feature];
                } finally {
                    delete feature[processingTag];
                    feature[processedTag] = true;
                }
            });
        }

        let sortedFeatures: IFeature[];
        try {
            sortedFeatures = recursiveCreateFeatureOrder(features);
        } finally {
            (features as (IFeature & {[processedTag]?: boolean})[]).forEach(feature => {
                delete feature[processedTag];
            });
        }

        // Creat the layers
        const layers: {prefix: (IFeature | IBaseFeature)[]; suffix: IFeature[]}[] = [
            {prefix: baseFeatures, suffix: []},
        ];

        sortedFeatures.forEach(feature => {
            const {name, parse} = feature;
            let layer: {prefix: IFeature[]; suffix: IFeature[]};
            let after = false;
            let relativeTo: IFeature | undefined;

            // Add the layer
            if ("lowerThan" in parse.precedence) {
                const lowerThan = parse.precedence.lowerThan;
                layer = {prefix: [], suffix: []};
                const index = layers.findIndex(layer =>
                    [...layer.prefix, ...layer.suffix].find(
                        ({name}) => name == lowerThan.name
                    )
                );
                if (index == -1)
                    throw Error(
                        `Feature "${name}" specified to have a lower precedence than "${lowerThan.name}", but "${lowerThan.name}" wasn't provided. \n Make sure that it's provided in the list of features, or change the 'lowerThan' property.`
                    );

                layers.splice(index + 1, 0, layer);
            } else {
                const sameAs = parse.precedence.sameAs;
                const foundLayer = layers.find(layer =>
                    [...layer.prefix, ...layer.suffix].find(
                        ({name}) => name == sameAs.name
                    )
                );

                if (!foundLayer)
                    throw Error(
                        `Feature "${name}" specified to have the same precedence as "${sameAs.name}", but "${sameAs.name}" wasn't provided. \n Make sure that it's provided in the list of features, or change the 'sameAs' property.`
                    );

                layer = foundLayer as {prefix: IFeature[]; suffix: IFeature[]};
                relativeTo = sameAs;
                after = parse.precedence.matchAfter ?? false;
            }

            // Add the feature to the layer
            const type = parse.type == "prefixBase" ? "prefix" : parse.type;
            const list = layer[type];
            const relativeIndex =
                relativeTo && list.findIndex(({name}) => relativeTo?.name);
            const index = relativeIndex ? (after ? 1 : 0) + relativeIndex : 0;
            list.splice(index, 0, feature);
        });

        return layers.slice(1) as {prefix: IFeature[]; suffix: IFeature[]}[];
    }

    /** The base case of the parser, which either isn't recursive at all, or doesn't start with a recursive term */
    protected base: (idxInCallingRule?: number | undefined, ...args: any[]) => ICST;

    /** The main expression entry rule */
    public expression = this.RULE("expression", () =>
        this.SUBRULE(this.precedenceRules[this.precedenceRules.length - 1].rule)
    );

    // Extra functions to be used by rules
    /**
     * Calls the given support rule
     * @param idx The index of the support rule (every call should have a unique index)
     * @param ruleToCall The feature support to call
     * @param options Additional options
     * @returns The created concrete syntax tree
     */
    protected supportRule(
        idx: number,
        ruleToCall: IFeatureSupport,
        options?: SubruleMethodOpts
    ): ICST {
        return this.subrule(idx, this.getSupportRule(ruleToCall), options);
    }

    /**
     * Retrieves the rule for a given feature support
     * @param support The feature support to obtain the chevrotain rule for
     * @returns The obtained rule
     */
    protected getSupportRule(support: IFeatureSupport): (...args: any[]) => ICST {
        const rule = this.supportRules.get(support.id);
        if (!rule)
            throw Error(`Requested support rule "${support.name}" wasn't provided`);
        return rule;
    }

    /**
     * Creates a function that will try whether a given rule succeeds from this location
     * @param grammarRule The rule to try and parse in backtracking mode.
     * @param args argument to be passed to the grammar rule execution
     *
     * @return a lookahead function that will try to parse the given grammarRule and will return true if succeed.
     */
    protected backtrack<T>(
        grammarRule: (...args: any[]) => T,
        args?: any[]
    ): () => boolean {
        this.LA;
        return this.BACKTRACK(grammarRule, args);
    }

    /**
     * Tries a given grammar rule and returns its result if successful and undefined otherwise
     * @param grammarRule The rule to be tried
     * @param data Additional data for trying the rule
     * @returns The result (or null if unsuccessful) and a function to revert the state
     */
    protected tryRule<T>(
        this: any,
        grammarRule: (...args: any[]) => T,
        {
            args,
            transformTokens,
        }: {
            /** The arguments to pass to the rule */
            args?: any[];
            /**
             * Transforms the current tokens to a new set of tokens to be used during parsing
             * @param tokens The current tokens to be transformed
             * @param currentIndex The current token index
             * @returns The newly obtained tokens
             */
            transformTokens?(tokens: IToken[], currentIndex: number): IToken[];
        } = {}
    ): {revert: () => void; result: T | null} {
        // See: https://github.com/Chevrotain/chevrotain/blob/e6c1f2a600ac0a31384b426ea6591c480c4a4b91/packages/chevrotain/src/parse/parser/traits/recognizer_api.ts#L683
        // save org state
        this.isBackTrackingStack.push(1);
        const orgState = this.saveRecogState();
        const oldTokens = this.input;
        const revert = () => {
            this.reloadRecogState(orgState);
            this.isBackTrackingStack.pop();
            this.input = oldTokens;
        };

        if (transformTokens) this.input = transformTokens(oldTokens, this.curIdx);

        try {
            return {result: grammarRule.apply(this, args), revert};
        } catch (e) {
            if (isRecognitionException(e)) {
                return {result: null, revert};
            } else {
                throw e;
            }
        }
    }

    /**
     * Retrieves the persistent data corresponding to some identifier
     * @param id The data identifier
     * @returns The data that can be modified
     */
    protected getData<T extends object>(id: ICSTDataIdentifier<T>): T {
        let data = (this.trackingData as any)[id.id as any];
        if (!data) data = (this.trackingData as any)[id.id as any] = id.init();
        return data;
    }
}

/**
 * Adds token types to the parser
 * @param config The parser's configuration
 * @returns The flattened token type list
 */
export function resolveTokenTypes(config: IParserConfig): TokenType[] {
    const supports = getFeatureSupports(config);

    // Combine all tokens
    const tokens: IUsedTokenTypes = [
        ...config.baseFeatures,
        ...config.features,
        ...supports,
    ].flatMap(feature => feature.parse.tokens ?? []);

    // Order the tokens
    const result: TokenType[] = [];
    tokens.forEach(type => {
        if ("before" in type) {
            const index = type.before ? result.indexOf(type.before) : result.length;
            result.splice(index - 1, 0, type);
        } else {
            result.push(type);
        }
    });
    return result;
}

/**
 * Checks whether a given precedence target is a feature
 * @param target The target to check
 * @returns Whether it's a feature itself
 */
export function isFeature(target: IFeaturePrecedenceTarget): target is IFeature {
    return "precedence" in target.parse;
}
