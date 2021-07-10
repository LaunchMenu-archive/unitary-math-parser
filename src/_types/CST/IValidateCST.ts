import {ICST} from "./ICST";
import {ICSTNode} from "./ICSTNode";

export type IValidateCST<T extends ICSTNode> = IValidateCSTTree | IValidateCSTNode<T>;

export type IValidateCSTTree = {
    /**
     * Checks whether a given complete tree is valid, has to perform recursion itself
     * @param tree The tree to be verified
     * @returns Whether the tree is valid, or a valid replacement tree
     */
    isTreeValid(tree: ICST): void | boolean | ICST;
};

export type IValidateCSTNode<T extends ICSTNode> = {
    /**
     * Checks whether a given node is valid, doesn't have to handle recursion
     * @param node The node to be verified
     * @param path The path to the specified node
     * @returns Whether the tree is valid, or a valid replacement node
     */
    isNodeValid(node: T, path: ICSTNode[]): void | boolean | T;
};
