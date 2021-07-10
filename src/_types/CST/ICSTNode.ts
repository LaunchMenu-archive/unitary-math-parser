import {IImmutable} from "../IImmutable";
import {ICSTLeaf} from "./ICSTLeaf";

export type ICSTNode<T extends (ICSTNode | ICSTLeaf)[] | undefined = undefined> =
    IImmutable<{
        /** The type of the node */
        type: string;
        /** The children of this node */
        children: T extends undefined ? (ICSTNode | ICSTLeaf)[] : T;
        /** The range of text */
        range: {
            start: number;
            end: number;
        };
        /** The precedence of this node. undefined if the node isn't an expression node, and Infinity if it's a base expression node */
        precedence?: number;
        /** If the node is an infix expression node, the associativity tells on what side brackets are implied */
        associativity?: "left" | "right";
    }>;
