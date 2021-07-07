import {ICSTParsingError, IParsingError} from "../../_types/errors/IParsingError";
import {IFeatureSyntax} from "../../_types/IFeatureSyntax";
import {IParserConfig} from "../../_types/IParserConfig";
import {IParsingResult} from "../../_types/IParsingResult";

export type IParseOutput<C extends IParserConfig, I extends boolean> =
    | {errors: I extends true ? ICSTParsingError[] : IParsingError[]}
    | IParsingResult<C extends IParserConfig<infer T> ? T : never>;
