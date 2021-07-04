import {IASTBase} from "../AST/IASTBase";
import {ICSTLeaf} from "./ICSTLeaf";

export type ICSTConversionNode<
    C extends (IASTBase | ICSTLeaf)[] = (IASTBase | ICSTLeaf)[]
> = Readonly<{
    /** The type of the node */
    type: string;
    /** The children of this node */
    children: Readonly<C>;
    /** The range of text */
    range: Readonly<{
        start: number;
        end: number;
    }>;
}>;
