import {IASTBase} from "../../_types/AST/IASTBase";
import {TGetConfigOutputAST} from "../../_types/AST/TGetConfigOutputAST";
import {TGetConfigReachableAST} from "../../_types/AST/TGetConfigReachableFeatureSyntax";
import {TGetReductionASTNode} from "../../_types/AST/TGetReductionASTNode";
import {ICST} from "../../_types/CST/ICST";
import {ICSTConversionNode} from "../../_types/CST/ICSTConversionNode";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {IParserConfig} from "../../_types/IParserConfig";
import {IRecurseFunc} from "../../_types/IRecurseFunc";
import {getFeatureSupports} from "../getFeatureSupports";

type IAbstractionFunc = {
    (tree: ICSTConversionNode, source: ICST): Omit<IASTBase, "type" | "source">;
};
export class ASTParser<C extends IParserConfig> {
    protected abstractionFuncs = new Map<string, IAbstractionFunc>();
    protected recFuncs = new Map<string, IRecurseFunc<any>["recurse"]>();

    protected config: C;

    /**
     * Creates a AST parser given a config
     * @param config The parser configuration
     */
    public constructor(config: C) {
        this.config = config;

        config.baseFeatures.forEach(feature => {
            this.abstractionFuncs.set(feature.name, feature.abstract as any);
            this.recFuncs.set(feature.name, feature.recurse);
        });
        config.features.forEach(feature => {
            this.abstractionFuncs.set(feature.name, feature.abstract as any);
            this.recFuncs.set(feature.name, feature.recurse);
        });
        getFeatureSupports(config).forEach(support => {
            this.abstractionFuncs.set(support.name, support.abstract);
            this.recFuncs.set(support.name, support.recurse);
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
     * Walks a tree and reduces it to some result
     * @param step The step case for the tree walk
     * @param tree The tree to be reduced
     * @returns The result of the reduction
     */
    public reduce<O>(
        step: (node: TGetReductionASTNode<TGetConfigReachableAST<C>, O>) => O,
        tree: TGetConfigOutputAST<C>
    ): O {
        const recurse = this.recFuncs.get(tree.type);
        if (!recurse)
            throw Error(`Was unable to recurse on a AST node of type "${tree.type}"`);

        const conversionNode = recurse(tree, n => this.reduce(step, n as any));
        return step(conversionNode as any);
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
}
