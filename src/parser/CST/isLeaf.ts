import {ICST} from "../../_types/CST/ICST";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";

/**
 * Checks whether a given node is a leaf
 * @param node The node to be checked
 * @returns whether it's a leaf
 */
export function isLeaf(node: ICST): node is ICSTLeaf {
    return "text" in node;
}
