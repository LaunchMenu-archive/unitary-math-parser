import {ICST} from "./ICST";
import {ICSTLeaf} from "./ICSTLeaf";

export type ICSTResult = {
    /** The tree that was obtained */
    tree: ICST;
    /**
     * Walks a tree and reduces it to some result
     * @param base The base case for the tree walk
     * @param step The step case for the tree walk
     * @returns The result of the reduction
     */
    reduce<T>(
        base: {
            /**
             * Returns the result for a given leaf
             * @param leaf The leaf that was found
             * @returns The result for the leaf
             */
            (leaf: ICSTLeaf): T;
        },
        step: {
            /**
             * Returns the result for a given node
             * @param type The type of the node that was found
             * @param children The results of the children of the node
             * @returns The result for this node
             */
            (type: string, children: T[]): T;
        }
    ): T;
};
