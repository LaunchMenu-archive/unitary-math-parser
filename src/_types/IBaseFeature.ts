import {ICST} from "./CST/ICST";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IASTBase} from "./AST/IASTBase";
import {IFeatureSupport} from "./IFeatureSupport";
import {TGetConversionTree} from "./CST/TGetConversionTree";
import {IUsedTokenTypes} from "./IUsedTokenTypes";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";

export type IBaseFeature<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The name of the feature */
    name: T["name"];
    /** The parsing data for the feature */
    parse: {
        /** The token types used by this feature */
        tokens?: IUsedTokenTypes;
        /**
         * Executes the rule
         * @param data The additional data the rule can use
         * @returns The obtained concrete syntax tree
         */
        exec(data: IFeatureRuleData): ICST;
        /** The supporting rules that are used by the rule */
        supports?: IFeatureSupport[];
    };
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
