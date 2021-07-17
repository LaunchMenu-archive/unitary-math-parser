import {IASTBase} from "../../_types/AST/IASTBase";
import {TGetConfigOutputAST} from "../../_types/AST/TGetConfigOutputAST";
import {TGetConfigReachableAST} from "../../_types/AST/TGetConfigReachableFeatureSyntax";
import {TGetReductionASTNode} from "../../_types/AST/TGetReductionASTNode";
import {ICST} from "../../_types/CST/ICST";
import {ICSTConversionNode} from "../../_types/CST/ICSTConversionNode";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {IParserConfig} from "../../_types/IParserConfig";
import {IExecutionFuncs} from "../../_types/IExecutionFunc";
import {getFeatureSupports} from "../getFeatureSupports";
import {IEvaluationError} from "../../_types/evaluation/IEvaluationError";
import {isEvaluationError} from "./isEvaluationError";
import {IFeatureCore} from "../../_types/IFeatureCore";
import {EvaluationContext} from "./EvaluationContext";
import {ITypeValidator} from "../../_types/evaluation/ITypeValidator";
import {createEvaluationErrorObject} from "./createEvaluationErrorsObject";
import {IEvaluator} from "../../_types/evaluation/IEvaluator";
import {ITypeMismatchEvaluationError} from "../../_types/evaluation/ITypeMismatchEvaluationError";
import {getSyntaxPointerMessage} from "../getSyntaxPointerMessage";
import {inputTextContextIdentifier} from "./inputTextContextIdentifier";

type IAbstractionFunc = {
    (tree: ICSTConversionNode, source: ICST): Omit<IASTBase, "type" | "source">;
};
export class ASTParser<C extends IParserConfig> {
    protected abstractionFuncs = new Map<string, IAbstractionFunc>();
    protected features = new Map<string, IFeatureCore & IExecutionFuncs<any>>();

    protected config: C;

    /**
     * Creates a AST parser given a config
     * @param config The parser configuration
     */
    public constructor(config: C) {
        this.config = config;

        config.baseFeatures.forEach(feature => {
            this.abstractionFuncs.set(feature.name, feature.abstract as any);
            this.features.set(feature.name, feature);
        });
        config.features.forEach(feature => {
            this.abstractionFuncs.set(feature.name, feature.abstract as any);
            this.features.set(feature.name, feature);
        });
        getFeatureSupports(config).forEach(support => {
            this.abstractionFuncs.set(support.name, support.abstract);
            this.features.set(support.name, support);
        });
    }

    /**
     * Creates an AST given a CST obtained from a CST parser with the same config as this AST parser
     * @param tree The tree to convert to a AST tree
     * @returns The AST tree
     */
    public createAST(tree: ICSTNode): TGetConfigOutputAST<C> {
        return this.createASTInternal(tree) as any;
    }

    /**
     * Creates an AST tree, where the intermediate result may be of any shape
     * @param tree The tree to convert
     * @returns The tree
     */
    protected createASTInternal(tree: ICSTNode): IASTBase {
        const conversionNode = {
            ...tree,
            children: tree.children.map(child => {
                if ("children" in child) return this.createASTInternal(child);
                else return child;
            }),
        };
        const abstract = this.abstractionFuncs.get(tree.type);
        if (!abstract)
            throw Error(
                `Was unable to create a AST node for CST node of type "${tree.type}"`
            );

        return {type: tree.type, source: tree, ...abstract(conversionNode, tree)};
    }

    /**
     * Walks a tree and reduces it to some result
     * @param step The step case for the tree walk
     * @param tree The tree to be reduced
     * @returns The result of the reduction
     */
    public reduce<O>(
        step: (node: TGetReductionASTNode<TGetConfigReachableAST<C>, O>) => O,
        tree: TGetConfigOutputAST<C>
    ): O {
        const feature = this.features.get(tree.type);
        if (!feature)
            throw Error(`Was unable to recurse on a AST node of type "${tree.type}"`);

        const conversionNode = feature.recurse(tree, n => this.reduce(step, n as any));
        return step(conversionNode as any);
    }

    /**
     * Evaluates a given tree to obtain its result
     * @param tree The tree to be evaluated
     * @param context The contextual data that nodes can use during evaluation
     * @param expression The text of the expression (which was transformed into the tree) used for error message creation
     * @returns The obtained value
     */
    public evaluate(
        tree: TGetConfigOutputAST<C>,
        context: EvaluationContext,
        expression: string
    ): Object {
        return this.innerEvaluate(
            tree,
            context.augment(inputTextContextIdentifier, expression),
            expression
        );
    }

    /**
     * Evaluates a given tree to obtain its result
     * @param tree The tree to be evaluated
     * @param context The contextual data that nodes can use during evaluation
     * @param expression The text of the expression (which was transformed into the tree) used for error message creation
     * @returns The obtained value
     */
    protected innerEvaluate(
        tree: TGetConfigOutputAST<C>,
        context: EvaluationContext,
        expression: string
    ): Object {
        const feature = this.features.get(tree.type);
        if (!feature) throw Error(`Was unable to evaluate node of type "${tree.type}"`);

        if (feature.evaluate instanceof Function)
            return feature.evaluate(tree, (node, context) =>
                this.innerEvaluate(node as any, context, expression)
            );

        // Recurse on all sub-expressions of the tree
        let errors: IEvaluationError[] = [];
        let values: {value: any; node: IASTBase}[] = [];
        const conversionNode = feature.recurse<any>(tree, n => {
            const value = this.innerEvaluate(n as any, context, expression);
            if (isEvaluationError(value)) errors.push(...value.errors);
            values.push({value, node: n});
            return value;
        });

        // Find an applicable evaluation rule
        let foundEvaluator = false;
        type ICheckData = {
            validator: ITypeValidator<any>;
            passed: boolean;
            node: IASTBase;
            value: any;
        };
        const evals = feature.evaluate.map(evaluator => {
            if (!evaluator) throw Error(`Incorrect evaluator passed to "${tree.type}"`);

            // If we already found something that passed, skip checking the next rules
            if (foundEvaluator) return {evaluator, passed: false, results: undefined};

            const results: ICheckData[] = [];
            let allPassed = true;
            try {
                let i = 0;
                feature.recurse(evaluator.validate, ((validate: ITypeValidator<any>) => {
                    const data = values[i++];
                    const passed = validate(data.value);
                    if (!passed) allPassed = false;
                    results.push({
                        validator: validate,
                        passed,
                        ...data,
                    });
                }) as any);
            } catch (e) {
                throw Error(
                    `The recurse of "${tree.type}" seems to have touched more than the recursive structure:\n ${e.message}`
                );
            }
            if (allPassed) foundEvaluator = true;
            return {evaluator, results, passed: allPassed};
        });

        // Compute the result if possible
        const applicableEvaluator = evals.find(({passed}) => passed);
        if (applicableEvaluator)
            return applicableEvaluator.evaluator.evaluate(conversionNode, context);

        // If the sub-expressions contained errors, return these
        if (errors.length > 0) return createEvaluationErrorObject(errors);

        // Otherwise compute an error message that shows that the data type wasn't applicable
        let mostMatched = 0; // Keep track of how many continuous sub-expressions starting from the left matched
        const validateOptions = evals
            .map(({results, ...rest}) => {
                if (results) {
                    const sortedResults = [...results].sort(
                        (a, b) => a.node.source.range.start - b.node.source.range.start
                    );
                    const matchCount = sortedResults.findIndex(({passed}) => !passed);
                    mostMatched = Math.max(matchCount, mostMatched);
                    return {results: sortedResults, matchCount, ...rest};
                }
                return {results, ...rest, matchCount: -1};
            })
            .filter(options => options.matchCount >= mostMatched);

        const expected = validateOptions.map(
            ({results}) => results![mostMatched].validator
        );
        const {node, value: found} = validateOptions[0].results![mostMatched];

        const expectedMessage = `Received: ${found}, but expected ${
            expected.length > 1 ? "one of: " : "a "
        }${expected.map(e => e.typeName).join(", ")}`;
        return createEvaluationErrorObject<ITypeMismatchEvaluationError>([
            {
                node,
                expected,
                found,
                type: "typeMismatch",
                source: tree.source,
                message: `Found expression of wrong data type at index ${node.source.range.start}. ${expectedMessage}`,
                multilineMessage: `Found expression of wrong data type:\n${getSyntaxPointerMessage(
                    expression,
                    node.source.range.start,
                    node.source.range.end
                )}\n${expectedMessage}`,
            },
        ]);
    }
}
