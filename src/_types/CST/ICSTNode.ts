import {IImmutable} from "../IImmutable";
import {ICSTLeaf} from "./ICSTLeaf";

export type ICSTNode = IImmutable<{
    /** The type of the node */
    type: string;
    /** The children of this node */
    children: (ICSTNode | ICSTLeaf)[];
    /** The range of text */
    range: {
        start: number;
        end: number;
    };
}>;
