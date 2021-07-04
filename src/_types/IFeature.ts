import {IFeatureParser} from "./IFeatureParser";
import {ICST} from "./CST/ICST";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IASTBase} from "./AST/IASTBase";
import {TGetConversionTree} from "./CST/TGetConversionTree";

export type IFeature<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The name of the feature */
    name: T["name"];
    /** The parsing data for the feature */
    parse: IFeatureParser;
    /**
     * Transforms the concrete syntax tree to an abstract syntax tree node
     * @param tree The concrete syntax tree node to transform
     * @param source The concrete syntax tree source node
     * @returns The abstract syntax tree node
     */
    abstract(
        tree: TGetConversionTree<T["CST"]>,
        source: ICST
    ): T["AST"] & Omit<IASTBase, "type">;
};
