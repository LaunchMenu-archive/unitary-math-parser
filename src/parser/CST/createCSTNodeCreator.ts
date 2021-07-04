import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {ICSTNode} from "../../_types/CST/ICSTNode";

/**
 * Creates a concrete syntax tree node
 * @param type The type of the node
 * @returns A function to add children and to finish the node
 */
export function createCSTNodeCreator(type: string): {
    addChild(child: ICSTLeaf | ICSTNode): void;
    finish(): ICSTNode;
} {
    const children: (ICSTNode | ICSTLeaf)[] = [];
    return {
        addChild(child: ICSTLeaf | ICSTNode) {
            if (!child?.range) return; // Makes sure that this doesn't error in the recording phase
            children.push(child);
        },
        finish() {
            return {
                type,
                children,
                range: {
                    start: Math.min(...children.map(child => child.range.start)),
                    end: Math.max(...children.map(child => child.range.end)),
                },
            };
        },
    };
}
