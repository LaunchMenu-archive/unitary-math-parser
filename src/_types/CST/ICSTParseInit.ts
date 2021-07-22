import {IToken} from "chevrotain";
import {IFeatureSyntax} from "../IFeatureSyntax";
import {IParserOps} from "../IParserOps";
import {IUsedTokenTypes} from "../IUsedTokenTypes";
import {ICorrectionSuggestionConfig} from "./ICorrectionSuggestionConfig";
import {TGetCSTNode} from "./TGetCSTNode";

export type ICSTParseBase<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The token types used by this feature */
    tokens?: IUsedTokenTypes;
    /** The supporting rules that are used by the rule */
    supports?: T["supports"];
    /** The functions to obtain suggestions for correcting any possibly found and corrected mistakes */
    correctionSuggestions?: ICorrectionSuggestionConfig<TGetCSTNode<T["CST"]>>;
    /**
     * Initializes data for parsing
     * @param data The data usable for initialization
     * @returns Nothing or a modified token list
     */
    init?(data: {
        /** The parser which data can be stored in */
        parser: IParserOps;
        /** The tokens of the input */
        tokens: IToken[];
        /** The text input */
        input: string;
    }): void | IToken[];
};
