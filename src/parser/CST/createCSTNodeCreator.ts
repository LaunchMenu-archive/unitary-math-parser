import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {ICSTNode} from "../../_types/CST/ICSTNode";

/**
 * Creates a concrete syntax tree node
 * @param type The type of the node
 * @param expressionData Data about the expression, in case it's an expression node
 * @returns A function to add children and to finish the node
 */
export function createCSTNodeCreator(
    type: string,
    expressionData?: {
        /** The precedence of the expression, or undefined if it's not an expression */
        precedence: number;
        /** The operator's associativity if it's a infix operator */
        associativity?: "left" | "right";
    }
): {
    addChild(child: ICSTLeaf | ICSTNode): void;
    finish(): ICSTNode;
} {
    const children: (ICSTNode | ICSTLeaf)[] = [];
    return {
        addChild(child: ICSTLeaf | ICSTNode) {
            children.push(child);
        },
        finish() {
            return {
                type,
                children,
                ...expressionData,
                range: {
                    start: Math.min(
                        ...children.map(child => child?.range?.start ?? Infinity)
                    ),
                    end: Math.max(
                        ...children.map(child => child?.range?.end ?? -Infinity)
                    ),
                },
            };
        },
    };
}
