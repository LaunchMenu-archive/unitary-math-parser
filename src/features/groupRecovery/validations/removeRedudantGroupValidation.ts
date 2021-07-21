import {ICSTLeaf} from "../../../_types/CST/ICSTLeaf";
import {ICSTNode} from "../../../_types/CST/ICSTNode";
import {IValidateCSTNode} from "../../../_types/CST/IValidateCST";

/**
 * A validation for the group recovery feature that skips groups when they don't affect the interpretation of the expression
 */
export const removeRedundantGroupValidation: IValidateCSTNode<
    ICSTNode<[ICSTLeaf, ICSTNode, ICSTLeaf]>
> = {
    isNodeValid: (node, path) => {
        const parent = path[path.length - 2];
        if (!parent) return false;

        const child = node.children[1];
        const parentPrecedence = parent.precedence ?? Infinity;
        const childPrecedence = child.precedence ?? 0;
        if (parentPrecedence == childPrecedence) {
            if (parent.children[0] == node) {
                // Child is the left child of the expression, if normal associativity is right, this was caused by the group
                return child.associativity == "right";
            } else {
                // Child is the right child of the expression, if normal associativity is left, this was caused by the group
                return child.associativity == "left";
            }
        }

        if (childPrecedence == Infinity) return child;
        return parentPrecedence > childPrecedence;
    },
};
