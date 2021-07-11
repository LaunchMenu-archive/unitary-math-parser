import {ICST} from "../../_types/CST/ICST";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {IValidateCST} from "../../_types/CST/IValidateCST";
import {reconstructTree} from "./reconstructTree";

/**
 * Checks whether a given tree is valid, and returns undefined if it's not
 * @param tree The tree to be checked
 * @param path The path to the changed group node
 * @param validates The checking function
 * @returns The validated tree
 */
export function validateTree(
    tree: ICSTNode,
    path: ICSTNode[],
    validates: IValidateCST<ICSTNode>[] | undefined
): ICSTNode | undefined {
    if (!validates) return tree;

    for (let validate of validates) {
        if ("isTreeValid" in validate) {
            const result = validate.isTreeValid(tree);
            if (typeof result == "boolean") {
                if (!result) return undefined;
            } else {
                if (!result) return undefined;
                tree = result;
            }
        }

        if ("isNodeValid" in validate) {
            const result = validate.isNodeValid(path[path.length - 1], path);
            if (typeof result == "boolean") {
                if (!result) return undefined;
            } else {
                if (!result) return undefined;
                // console.log(path, result);
                const newPath = reconstructTree(path, result);
                tree = newPath[0];
            }
        }
    }
    return tree;
}
