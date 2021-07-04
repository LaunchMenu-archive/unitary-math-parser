import {IToken} from "chevrotain";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";

/**
 * Creates a concrete syntax leaf
 * @param token The token to create a leaf for
 * @returns The leaf to be created
 */
export function createCSTLeaf(token: IToken): ICSTLeaf {
    return {
        type: token.tokenType,
        text: token.image,
        range: {
            start: token.startOffset,
            end: token.endOffset ? token.endOffset + 1 : token.startOffset,
        },
    };
}
