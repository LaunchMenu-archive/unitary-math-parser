import {TAbstractionOutput} from "./AST/TAbstractionOutput";
import {ICSTNode} from "./CST/ICSTNode";
import {TGetConversionTree} from "./CST/TGetConversionTree";
import {IFeatureSyntax} from "./IFeatureSyntax";

/** The core data of any feature type */
export type IFeatureCore<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The name of the feature */
    name: T["name"];
    /**
     * Transforms the concrete syntax tree to an abstract syntax tree node
     * @param tree The concrete syntax tree node to transform
     * @param source The concrete syntax tree source node
     * @returns The abstract syntax tree node
     */
    abstract(tree: TGetConversionTree<T["CST"]>, source: ICSTNode): TAbstractionOutput<T>;
};
