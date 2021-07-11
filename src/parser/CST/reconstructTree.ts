import {ICST} from "../../_types/CST/ICST";
import {ICSTNode} from "../../_types/CST/ICSTNode";

/**
 * Reconstructs a tree given a path to a node and that node's replacement
 * @param path The path to the node to replace
 * @param newNode The new node to replace the node at the path with
 * @returns The path to the new node
 */
export function reconstructTree(path: ICSTNode[], newNode: ICST): ICSTNode[] {
    const orNode = path[path.length - 1];
    const newPath = path.slice(0, -1).reduceRight(
        ({orNode, newNode, path}, pathNode) => {
            const nextNode = replaceChild(pathNode, orNode, newNode);
            return {
                orNode: pathNode,
                newNode: nextNode,
                path: [nextNode, ...path],
            };
        },
        {orNode: orNode, newNode: newNode, path: [newNode] as ICSTNode[]}
    );
    return newPath.path;
}

/**
 * Retrieves a node representing the specified node, with a child node replaced for a new node
 * @param node The node to be changed
 * @param oldNode The child node to replace
 * @param newNode The new node to take the child node's place
 * @returns The newly created node
 */
export function replaceChild(node: ICSTNode, oldNode: ICST, newNode: ICST): ICSTNode {
    return {
        ...node,
        children: node.children.map(child => (child == oldNode ? newNode : child)),
    };
}
