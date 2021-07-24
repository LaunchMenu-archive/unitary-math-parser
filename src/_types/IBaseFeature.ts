import {IFeatureSyntax} from "./IFeatureSyntax";
import {IFeatureRuleData} from "./CST/IFeatureRuleData";
import {ICSTParseBase} from "./CST/ICSTParseInit";
import {IExecutionFuncs} from "./IExecutionFunc";
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
