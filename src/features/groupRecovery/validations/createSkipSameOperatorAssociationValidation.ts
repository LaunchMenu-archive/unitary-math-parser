import {ICSTLeaf} from "../../../_types/CST/ICSTLeaf";
import {ICSTNode} from "../../../_types/CST/ICSTNode";
import {IValidateCSTNode} from "../../../_types/CST/IValidateCST";

/**
 * A function that retrieves a validator for the recovery group feature which checks that we're not just re-associating within a sequence of the same operator type
 * @param types The types to check for
 * @returns The validator
 */
export function createSkipSameOperationValidation(
    types: string[]
): IValidateCSTNode<ICSTNode<[ICSTLeaf, ICSTNode, ICSTLeaf]>> {
    return {
        isNodeValid: (node, path) => {
            const childType = node.children[1].type;
            return !types.includes(childType) || path[path.length - 2]?.type != childType;
        },
    };
}
