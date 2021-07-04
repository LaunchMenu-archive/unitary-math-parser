import {IToken} from "chevrotain";
import {IParserOps} from "../IParserOps";
import {ICSTLeaf} from "./ICSTLeaf";
import {ICSTNode} from "./ICSTNode";

/**
 * The data that rules can use for their parsing
 */
export type IRuleData = {
    /** The parser to use */
    parser: IParserOps;
    /**
     * Creates a new leaf
     * @param token The token to convert into a CST leaf
     * @returns THe CST leaf
     */
    createLeaf(token: IToken): ICSTLeaf;
    /**
     * Creates a new node
     * @returns Create the node creation functions
     */
    createNode(): {
        /**
         * Adds a new child to the node
         * @param child The child to add
         */
        addChild(child: ICSTLeaf | ICSTNode): void;
        /**
         * Finishes the node
         * @returns The created node
         */
        finish(): ICSTNode;
    };
};
