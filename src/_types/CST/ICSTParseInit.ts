import {IToken} from "chevrotain";
import {IParserOps} from "../IParserOps";

export type ICSTParseInit = {
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
