import {IASTBase} from "../../_types/AST/IASTBase";
import {TGetSyntaxASTType} from "../../_types/AST/TGetSyntaxASTType";
import {TMakeASTRecursive} from "../../_types/AST/TMakeASTRecursive";
import {ICST} from "../../_types/CST/ICST";
import {ICSTConversionNode} from "../../_types/CST/ICSTConversionNode";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {IFeatureSyntax} from "../../_types/IFeatureSyntax";
import {IParserConfig} from "../../_types/IParserConfig";
import {getFeatureSupports} from "../getFeatureSupports";

/**
 * Creates a AST parser given a config
 * @param config The parser configuration
 * @returns The AST parser
 */
export function createASTParser<T extends IFeatureSyntax>(
    config: IParserConfig<T>
): {
    /**
     * Creates a AST given a CST
     * @param tree The tree to make abstract
     * @returns The abstract tree that was created
     */
    (tree: ICST): TMakeASTRecursive<TGetSyntaxASTType<T>>;
} {
    // Retrieve  the abstraction functions
    const abstractionFuncs = new Map<
        string,
        {(tree: ICSTConversionNode, source: ICST): Omit<IASTBase, "type" | "source">}
    >();
    config.baseFeatures.forEach(feature => {
        abstractionFuncs.set(feature.name, feature.abstract as any);
    });
    config.features.forEach(feature => {
        abstractionFuncs.set(feature.name, feature.abstract as any);
    });
    getFeatureSupports(config).forEach(support => {
        abstractionFuncs.set(support.name, support.abstract);
    });

    // Create the general recursive AST creator
    function createAST(tree: ICSTNode): IASTBase {
        const conversionNode = {
            ...tree,
            children: tree.children.map(child => {
                if ("children" in child) return createAST(child);
                else return child;
            }),
        };
        const abstract = abstractionFuncs.get(tree.type);
        if (!abstract)
            throw Error(
                `Was unable to create a AST node for CST node of type "${tree.type}"`
            );

        return {type: tree.type, source: tree, ...abstract(conversionNode, tree)};
    }

    // Return the recursive conversion function
    return createAST as any;
}
