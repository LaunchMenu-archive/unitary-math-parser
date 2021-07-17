import {IFeatureSyntax} from "./IFeatureSyntax";
import {IUsedTokenTypes} from "./IUsedTokenTypes";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";
import {ICSTParseInit} from "./CST/ICSTParseInit";
import {IExecutionFuncs} from "./IExecutionFunc";
import {TGetCSTNode} from "./CST/TGetCSTNode";
import {ICorrectionSuggestionConfig} from "./CST/ICorrectionSuggestionConfig";
import {ICSTNode} from "./CST/ICSTNode";
import {IFeatureCore} from "./IFeatureCore";

export type IBaseFeature<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The parsing data for the feature */
    parse: {
        /** The token types used by this feature */
        tokens?: IUsedTokenTypes;
        /**
         * Executes the rule
         * @param data The additional data the rule can use
         * @returns The obtained concrete syntax tree
         */
        exec(data: IFeatureRuleData): ICSTNode;
        /** The supporting rules that are used by the rule */
        supports?: T["supports"];
        /** The functions to obtain suggestions for correcting any possibly found and corrected mistakes */
        correctionSuggestions?: ICorrectionSuggestionConfig<TGetCSTNode<T["CST"]>>;
    } & ICSTParseInit;
} & IFeatureCore<T> &
    IExecutionFuncs<T>;
