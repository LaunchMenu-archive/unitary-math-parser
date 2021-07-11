import {ICST} from "./CST/ICST";
import {IASTBase} from "./AST/IASTBase";
import {TGetConversionTree} from "./CST/TGetConversionTree";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IUsedTokenTypes} from "./IUsedTokenTypes";
import {IRuleData} from "./CST/IRuleData";
import {ICSTParseInit} from "./CST/ICSTParseInit";
import {ICorrectionSuggestionConfig} from "./CST/ICorrectionSuggestionConfig";
import {TGetCSTNode} from "./CST/TGetCSTNode";
import {TAbstractionOutput} from "./AST/TAbstractionOutput";
import {IRecurseFunc} from "./IRecurseFunc";
import {ICSTNode} from "./CST/ICSTNode";

export type IFeatureSupport<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The name of the supporting rule */
    name: T["name"];
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
    /**
     * Transforms the concrete syntax tree to an abstract syntax tree node
     * @param tree The concrete syntax tree node to transform
     * @returns The abstract syntax tree node
     */
    abstract(tree: TGetConversionTree<T["CST"]>, source: ICSTNode): TAbstractionOutput<T>;
} & IRecurseFunc<T>;
