import {IToken} from "chevrotain";
import {IUnknownCharacterError} from "../../_types/errors/IUnknownCharacterError";

export type ITokenizerResult = {
    tokens: IToken[];
    errors: IUnknownCharacterError[];
};
