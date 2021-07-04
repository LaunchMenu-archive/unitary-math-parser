import {
    EmbeddedActionsParser,
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

let tokenList: TokenType[];
export class CSTParser extends EmbeddedActionsParser {
    /** The configuration of the parser */
    protected config: IParserConfig;

    /** The rules for the different precedence levels */
    protected precedenceRules: {
        features: {prefix: IFeature[]; suffix: IFeature[]};
        rule: (idxInCallingRule?: number | undefined, ...args: any[]) => ICST;
    }[];

    /** The support rules */
    protected supportRules: Map<string, (idx: number) => ICST> = new Map();

    /** The lexer to tokenize the input */
    protected lexer: Lexer;

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
        const {tokens} = this.lexer.tokenize(text);
        this.input = tokens;

        const result = this.expression();
        console.log(this.errors);
        return result;
    }

    /**
     * Converts the parser config the the proper parser structure
     */
    protected createStaticStructure() {
        // Extract the supporting rules
        const featureSupports = this.getSupportRules([
            ...this.config.baseFeatures,
            ...this.config.features,
        ]);
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
                prefixRule = this.RULE(`p${index}-prefix`, () => {
                    const options = prefixOptionRules.map((rule, i) => ({
                        ALT: () => this.subrule(i, rule),
                    }));
                    return this.OR([...options, fallThrough]);
                });
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
     * Retrieves all feature supports
     * @param features The features to obtain the supports from
     * @returns The feature supports list
     */
    protected getSupportRules(features: ISupportable[]): IFeatureSupport[] {
        const stack: ISupportable[] = [...features];

        const allSupports: Map<string, IFeatureSupport> = new Map();

        while (stack.length > 0) {
            const supportable = stack.pop();
            const supports = supportable!.parse.supports ?? [];
            for (let support of supports)
                if (!allSupports.has(support.id)) {
                    allSupports.set(support.id, support);
                    stack.push(support);
                }
        }

        return [...allSupports.values()];
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
            const list = layer[parse.type];
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
        const rule = this.supportRules.get(ruleToCall.id);
        if (!rule)
            throw Error(`Requested support rule "${ruleToCall.name}" wasn't provided`);
        return this.subrule(idx, rule, options);
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
