import {IToken} from "chevrotain";
import {IASTResult} from "./AST/IASTResult";
import {IAlternativeCSTValidation} from "./CST/IAlternativeCSTValidation";
import {ICSTResult} from "./CST/ICSTResult";
import {IUnknownCharacterError} from "./errors/IUnknownCharacterError";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IParserConfig} from "./IParserConfig";

/** The result after parsing */
export type IParsingResult<C extends IParserConfig> = {
    /** Data related to tokenization */
    readonly tokenization: {
        /** The tokens of the input */
        readonly tokens: IToken[];
        /** The errors that were found while tokenizing */
        readonly errors: IUnknownCharacterError[];
    };
    /** The concrete syntax tree obtained from the result */
    readonly cst: ICSTResult;
    /** The abstract syntax tree of the input */
    get ast(): IASTResult<C>;
    /** Checks whether the result contains a correction */
    get containsCorrection(): boolean;
    /**
     * Retrieves all the correction alternatives for this CST
     * @param validations The validations to use in order to skip some alternatives
     * @returns The generator to obtain all alternatives
     */
    getCorrectionAlternatives(
        validations?: IAlternativeCSTValidation<IFeatureSyntax>[]
    ): Generator<Omit<IParsingResult<C>, "correctionAlternatives">>;
};
