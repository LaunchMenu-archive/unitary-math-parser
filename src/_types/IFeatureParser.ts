import {ICorrectionSuggestionConfig} from "./CST/ICorrectionSuggestionConfig";
import {ICST} from "./CST/ICST";
import {ICSTNode} from "./CST/ICSTNode";
import {ICSTParseInit} from "./CST/ICSTParseInit";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";
import {TGetCSTNode} from "./CST/TGetCSTNode";
import {IBaseFeature} from "./IBaseFeature";
import {IFeature} from "./IFeature";
import {IFeatureSupport} from "./IFeatureSupport";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IUsedTokenTypes} from "./IUsedTokenTypes";

export type IFeatureParser<T extends IFeatureSyntax> =
    | IFeatureParserPrefix<T>
    | IFeatureParserInfix<T>
    | IFeatureParserSuffix<T>;

export type IFeatureParserInfix<T extends IFeatureSyntax> = IFeatureParserBase<T> & {
    /** The type of the operator */
    type: "infix";
    /** Whether the operator is left or right associative */
    associativity: "left" | "right";
    /**
     * Executes the rule
     * @param node The recursively obtained node
     * @param data The additional data the rule can use
     * @returns The obtained concrete syntax tree
     */
    exec(node: ICSTNode, data: IFeatureRuleData): ICSTNode;
};

export type IFeatureParserSuffix<T extends IFeatureSyntax> = IFeatureParserBase<T> & {
    /** The type of the operator */
    type: "suffix";
    /**
     * Executes the rule
     * @param node The recursively obtained node
     * @param data The additional data the rule can use
     * @returns The obtained concrete syntax tree
     */
    exec(node: ICSTNode, data: IFeatureRuleData): ICSTNode;
};

export type IFeatureParserPrefix<T extends IFeatureSyntax> = IFeatureParserBase<T> & {
    /** The type of the operator */
    type: "prefix" | "prefixBase"; // Prefix base removes the fallthrough case of the prefix
    /**
     * Executes the rule
     * @param data The additional data the rule can use
     * @returns The obtained concrete syntax tree
     */
    exec(data: IFeatureRuleData): ICSTNode;
};

export type IFeatureParserBase<T extends IFeatureSyntax> = {
    /** The token types used by this feature */
    tokens?: IUsedTokenTypes;
    /** The supporting rules that are used by the rule */
    supports?: T["supports"] extends any[] ? T["supports"] : [];
    /** Specifies the precedence relation to another feature */
    precedence:
        | {
              /** Specifies the precedence should be just lower than that of another feature */
              lowerThan: IFeaturePrecedenceTarget[];
          }
        | {
              /** Specifies the precedence should be the same as another feature*/
              sameAs: IFeature<IFeatureSyntax>[];
              /** Specifies to try and match this feature after the one it has the same precedence to (in case there is overlap between the syntax they match) */
              matchAfter?: boolean;
          };
    /** The functions to obtain suggestions for correcting any possibly found and corrected mistakes */
    correctionSuggestions?: ICorrectionSuggestionConfig<TGetCSTNode<T["CST"]>>;
} & ICSTParseInit;

export type IFeaturePrecedenceTarget =
    | IFeature<IFeatureSyntax>
    | IBaseFeature<IFeatureSyntax>;
