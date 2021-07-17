import {IFeatureSyntax} from "./IFeatureSyntax";
import {IUsedTokenTypes} from "./IUsedTokenTypes";
import {IRuleData} from "./CST/IRuleData";
import {ICSTParseInit} from "./CST/ICSTParseInit";
import {ICorrectionSuggestionConfig} from "./CST/ICorrectionSuggestionConfig";
import {TGetCSTNode} from "./CST/TGetCSTNode";
import {IExecutionFuncs} from "./IExecutionFunc";
import {ICSTNode} from "./CST/ICSTNode";
import {IFeatureCore} from "./IFeatureCore";

export type IFeatureSupport<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** A unique identifier of the supporting rule */
    id: string;
    /** The parsing data for the feature support */
    parse: {
        /** The token types used by this feature */
        tokens?: IUsedTokenTypes;
        /**
         * Parses the data for this support
         * @param data The data that can be used for parsing
         * @returns The concrete syntax tree node
         */
        exec(data: IRuleData): ICSTNode;
        /** The supporting rules that are used by the rule */
        supports?: T["supports"];
        /** The functions to obtain suggestions for correcting any possibly found and corrected mistakes */
        correctionSuggestions?: ICorrectionSuggestionConfig<TGetCSTNode<T["CST"]>>;
    } & ICSTParseInit;
} & IFeatureCore<T> &
    IExecutionFuncs<T>;
