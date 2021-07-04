import {ICST} from "./CST/ICST";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";
import {IBaseFeature} from "./IBaseFeature";
import {IFeature} from "./IFeature";
import {IFeatureSupport} from "./IFeatureSupport";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IUsedTokenTypes} from "./IUsedTokenTypes";

export type IFeatureParser = IFeatureParserSuffix | IFeatureParserPrefix;

export type IFeatureParserSuffix = IFeatureParserBase & {
    /** The type of the operator */
    type: "suffix";
    /**
     * Executes the rule
     * @param node The recursively obtained node
     * @param data The additional data the rule can use
     * @returns The obtained concrete syntax tree
     */
    exec(node: ICST, data: IFeatureRuleData): ICST;
};

export type IFeatureParserPrefix = IFeatureParserBase & {
    /** The type of the operator */
    type: "prefix";
    /**
     * Executes the rule
     * @param data The additional data the rule can use
     * @returns The obtained concrete syntax tree
     */
    exec(data: IFeatureRuleData): ICST;
};

export type IFeatureParserBase = {
    /** The token types used by this feature */
    tokens?: IUsedTokenTypes;
    /** The supporting rules that are used by the rule */
    supports?: IFeatureSupport[];
    /** Specifies the precedence relation to another feature */
    precedence:
        | {
              /** Specifies the precedence should be just lower than that of another feature */
              lowerThan: IFeaturePrecedenceTarget;
          }
        | {
              /** Specifies the precedence should be the same as another feature*/
              sameAs: IFeature<IFeatureSyntax>;
              /** Specifies to try and match this feature after the one it has the same precedence to (in case there is overlap between the syntax they match) */
              matchAfter?: boolean;
          };
};

export type IFeaturePrecedenceTarget =
    | IFeature<IFeatureSyntax>
    | IBaseFeature<IFeatureSyntax>;
