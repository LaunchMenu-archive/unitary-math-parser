import {ICSTLeaf} from "../../../_types/CST/ICSTLeaf";
import {ICSTNode} from "../../../_types/CST/ICSTNode";
import {IValidateCSTNode} from "../../../_types/CST/IValidateCST";

/**
 * A validation for the group recovery feature that makes sure that groups surrounding base features are removed
 */
export const removeBaseOperatorGroupValidation: IValidateCSTNode<
    ICSTNode<[ICSTLeaf, ICSTNode, ICSTLeaf]>
> = {
    isNodeValid: node => {
        const child = node.children[1];
        if (child.precedence == Infinity) return child;
        return true;
    },
};
