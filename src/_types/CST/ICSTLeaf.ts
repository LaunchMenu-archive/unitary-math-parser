import {TokenType} from "chevrotain";
import {IImmutable} from "../IImmutable";

export type ICSTLeaf = IImmutable<{
    /** The type of the leaf */
    type: TokenType;
    /** The text of the node */
    text: string;
    /** The range of the text */
    range: {
        start: number;
        end: number;
    };
}>;
