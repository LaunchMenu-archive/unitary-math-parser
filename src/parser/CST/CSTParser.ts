import {ICST} from "../../_types/CST/ICST";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {isLeaf} from "./isLeaf";
import {CSTParserBase} from "./CSTParserBase";
import {ICSTParsingError} from "../../_types/errors/IParsingError";
import {IToken} from "chevrotain";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {IFeatureSyntax} from "../../_types/IFeatureSyntax";
import {IAlternativeCSTValidation} from "../../_types/CST/IAlternativeCSTValidation";
import {IParserConfig} from "../../_types/IParserConfig";
import {IFeature} from "../../_types/IFeature";
import {IBaseFeature} from "../../_types/IBaseFeature";
import {IFeatureSupport} from "../../_types/IFeatureSupport";
import {ICorrectionSuggestionNodeConfig} from "../../_types/CST/ICorrectionSuggestionConfig";
import {
    IValidateCST,
    IValidateCSTNode,
    IValidateCSTTree,
} from "../../_types/CST/IValidateCST";
import {replaceChild} from "./reconstructTree";
import {validateTree} from "./validateTree";
import {IErrorObject} from "../../_types/IErrorObject";

export class CSTParser extends CSTParserBase {
    protected featuresWithAlternatives: (IFeature | IBaseFeature | IFeatureSupport)[];

    /**
     * Creates a new parser
     * @param config The configuration for the parser
     */
    public constructor(config: IParserConfig) {
        super(config);

        this.featuresWithAlternatives = [
            ...this.supports,
            ...this.config.features,
            ...this.config.baseFeatures,
        ].filter(({parse}) => parse.correctionSuggestions);
    }

    /**
     * Parses the given text input
     * @param tokens The tokens to be parsed
     * @param text The text that's being parsed
     * @returns Th concrete syntax tree
     */
    public parse(
        tokens: IToken[],
        text: string
    ): ICSTNode | IErrorObject<ICSTParsingError> {
        return super.parse(tokens, text);
    }

    /**
     * Walks a tree and reduces it to some result
     * @param base The base case for the tree walk
     * @param step The step case for the tree walk
     * @param tree The tree to be reduced
     * @returns The result of the reduction
     */
    public reduce<T>(
        base: {
            /**
             * Returns the result for a given leaf
             * @param leaf The leaf that was found
             * @returns The result for the leaf
             */
            (leaf: ICSTLeaf): T;
        },
        step: {
            /**
             * Returns the result for a given node
             * @param type The type of the node that was found
             * @param children The results of the children of the node
             * @returns The result for this node
             */
            (type: string, children: T[]): T;
        },
        tree: ICST
    ): T {
        if (isLeaf(tree)) return base(tree);
        else
            return step(
                tree.type,
                tree.children.map(child => this.reduce(base, step, child))
            );
    }

    /**
     * Computes all alternatives for the given tree
     * @param tree The tree to compute alternatives for
     * @param validations Validations to skip some of the trees in the output
     * @returns The generator for different CST options
     */
    public *computeAlternatives(
        tree: ICSTNode,
        validations: IAlternativeCSTValidation<IFeatureSyntax>[] = []
    ): Generator<ICSTNode> {
        const trees = this.computeAllValidCSTS(tree, validations);
        let first = true;
        for (let tree of trees) {
            if (!first) yield tree;
            first = false;
        }
        if (first)
            throw Error(
                "One of the features' alternatives didn't yield the original tree, this is likely a mistake in the feature's code"
            );
    }

    /**
     * Computes all alternatives for the given tree, including the tree itself
     * @param tree The tree to compute alternatives for
     * @param validations Validations to skip some of the trees in the output
     * @returns The generator for different CST options
     */
    public computeAllValidCSTS(
        tree: ICSTNode,
        validations: IAlternativeCSTValidation<IFeatureSyntax>[] = []
    ): Generator<ICSTNode> {
        const This = this;

        // A function that generates all trees for all correction features from the given index forwards
        function* generate(index: number): Generator<ICSTNode> {
            const feature = This.featuresWithAlternatives[index];
            const suggestionData = feature?.parse?.correctionSuggestions;
            if (!suggestionData) {
                yield tree;
                return;
            }

            // Obtain all validators for this node type
            const validators =
                validations.find(({feature: f}) => f == feature)?.validation ??
                suggestionData.defaultValidation;
            const nodeValidators =
                validators?.filter(
                    (validator): validator is IValidateCSTNode<any> =>
                        "isNodeValid" in validator
                ) ?? [];
            const treeValidators =
                validators?.filter(
                    (validator): validator is IValidateCSTTree =>
                        "isTreeValid" in validator
                ) ?? [];

            // Go through all options of previously generated trees, and combine it with the new suggestion data
            for (let treeOption of generate(index + 1)) {
                if ("getTrees" in suggestionData) {
                    const trees = suggestionData.getTrees(treeOption, validators);
                    if (suggestionData.generationPerformsValidation === true) {
                        yield* trees;
                        continue;
                    }

                    for (let tree of trees) {
                        // Perform validations
                        const validatedTree =
                            // We can skip tree validation if the generator already performs it
                            suggestionData.generationPerformsValidation == "tree"
                                ? tree
                                : validateTree(tree, [], treeValidators);
                        if (validatedTree) {
                            if (
                                nodeValidators.length &&
                                // We can skip node validation if the generator already performs it
                                suggestionData.generationPerformsValidation != "node"
                            ) {
                                const nodeValidated = This.validateNodesTree(
                                    tree,
                                    feature.name,
                                    nodeValidators
                                );
                                if (nodeValidated) yield nodeValidated;
                            } else yield validatedTree;
                        }
                    }
                } else {
                    const trees = This.computeAlternativeTressForNode(
                        treeOption,
                        feature.name,
                        suggestionData,
                        !([true, "node"] as any[]).includes(
                            suggestionData.generationPerformsValidation
                        ),
                        nodeValidators,
                        []
                    );
                    if (
                        ([true, "tree"] as any[]).includes(
                            suggestionData.generationPerformsValidation
                        )
                    ) {
                        yield* trees;
                        continue;
                    }

                    for (let tree of trees) {
                        const validatedTree = validateTree(tree, [], treeValidators);
                        if (validatedTree) yield validatedTree;
                    }
                }
            }
        }

        return generate(0);
    }

    /**
     * Generates all alternatives for the given tree, using the given generator node rule
     * @param tree The tree to find alternatives for
     * @param type The type of node to apply this alternative function to
     * @param nodeGenerator The suggestion generator for a given node
     * @param performValidation Whether any additional validation is needed, or whether the generator takes care of validation
     * @param nodeValidations All validations that are specific to the node
     * @param path The path from the root to the passed subtree (excluding the subtree itself)
     * @returns The generator to obtain all possible valid alternatives for this tree
     */
    protected computeAlternativeTressForNode<T extends ICSTNode>(
        tree: ICSTNode,
        type: string,
        nodeGenerator: ICorrectionSuggestionNodeConfig<T>,
        performValidation: boolean,
        nodeValidations: IValidateCSTNode<T>[],
        path: ICSTNode[] = []
    ): Generator<ICSTNode> {
        const This = this;

        let baseGenerator: () => Generator<ICSTNode>;
        if (tree.type == type) {
            baseGenerator = function* () {
                let newTrees = nodeGenerator.getNodes(tree as T, path, nodeValidations);
                for (let newTree of newTrees) {
                    const validatedTree = performValidation
                        ? validateTree(newTree, path, nodeValidations)
                        : newTree;
                    if (validatedTree) yield validatedTree;
                }
            };
        } else {
            // If the type of the node isn't what we are looking for it doesn't affect the base options
            baseGenerator = function* () {
                yield tree;
            };
        }

        // Get the combination of all possible changes in children too
        const newPath = [...path, tree];
        const generator = tree.children.reduce<() => Generator<ICSTNode>>(
            (priorSiblingsGenerator, child) =>
                isLeaf(child)
                    ? priorSiblingsGenerator
                    : function* () {
                          for (let tree of priorSiblingsGenerator()) {
                              for (let newChild of This.computeAlternativeTressForNode(
                                  child,
                                  type,
                                  nodeGenerator,
                                  performValidation,
                                  nodeValidations,
                                  newPath
                              )) {
                                  if (newChild == child) {
                                      yield tree;
                                  } else {
                                      yield replaceChild(tree, child, newChild);
                                  }
                              }
                          }
                      },
            baseGenerator
        );
        return generator();
    }

    /**
     * Validates the nodes of a given tree
     * @param tree The tree to be validated
     * @param type The type of node to check for
     * @param nodeValidations The validations to apply
     * @param path The path to the tree
     * @returns Either the validated tree, or undefined if the tree is invalid
     */
    protected validateNodesTree<T extends ICSTNode>(
        tree: ICSTNode,
        type: string,
        nodeValidations: IValidateCSTNode<T>[],
        path: ICSTNode[] = []
    ): ICSTNode | undefined {
        const newPath = [...path, tree];
        if (tree.type == type) {
            const newTree = validateTree(tree, newPath, nodeValidations);
            if (!newTree) return undefined;
            tree = newTree;
        }

        for (let child of tree.children) {
            if (!isLeaf(child)) {
                const newTree = this.validateNodesTree(
                    child,
                    type,
                    nodeValidations,
                    newPath
                );
                if (!newTree) return undefined;

                if (newTree != child) tree = replaceChild(tree, child, newTree);
            }
        }

        return tree;
    }
}
