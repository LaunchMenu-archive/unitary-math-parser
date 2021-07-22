import {IFeatureSyntax} from "./IFeatureSyntax";
import {IUsedTokenTypes} from "./IUsedTokenTypes";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";
import {ICSTParseBase} from "./CST/ICSTParseInit";
import {IExecutionFuncs} from "./IExecutionFunc";
import {TGetCSTNode} from "./CST/TGetCSTNode";
import {ICorrectionSuggestionConfig} from "./CST/ICorrectionSuggestionConfig";
import {ICSTNode} from "./CST/ICSTNode";
import {IFeatureCore} from "./IFeatureCore";

export type IBaseFeature<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The parsing data for the feature */
    parse: {
        /**
         * Executes the rule
         * @param data The additional data the rule can use
         * @returns The obtained concrete syntax tree
         */
        exec(data: IFeatureRuleData): ICSTNode;
    } & ICSTParseBase<T>;
} & IFeatureCore<T> &
    IExecutionFuncs<T>;
