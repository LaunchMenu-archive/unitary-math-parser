import {ICST} from "./CST/ICST";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {TGetConversionTree} from "./CST/TGetConversionTree";
import {IUsedTokenTypes} from "./IUsedTokenTypes";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";
import {ICSTParseInit} from "./CST/ICSTParseInit";
import {TAbstractionOutput} from "./AST/TAbstractionOutput";
import {TGetPlainAST} from "./AST/TGetPlainAST";
import {IASTBase} from "./AST/IASTBase";
import {TGetReductionASTNode} from "./AST/TGetReductionASTNode";
import {IRecurseFunc} from "./IRecurseFunc";

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
        supports?: T["supports"];
    } & ICSTParseInit;
    /**
     * Transforms the concrete syntax tree to an abstract syntax tree node
     * @param tree The concrete syntax tree node to transform
     * @param source The concrete syntax tree source node
     * @returns The abstract syntax tree node
     */
    abstract(tree: TGetConversionTree<T["CST"]>, source: ICST): TAbstractionOutput<T>;
} & IRecurseFunc<T>;
