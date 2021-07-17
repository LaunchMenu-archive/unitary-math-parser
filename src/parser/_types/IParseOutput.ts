import {ICSTParsingError, IParsingError} from "../../_types/errors/IParsingError";
import {IErrorObject} from "../../_types/IErrorObject";
import {IParserConfig} from "../../_types/IParserConfig";
import {IParsingResult} from "../../_types/IParsingResult";

export type IParseOutput<C extends IParserConfig, I extends boolean> =
    | IErrorObject<I extends true ? ICSTParsingError : IParsingError>
    | IParsingResult<C>;
