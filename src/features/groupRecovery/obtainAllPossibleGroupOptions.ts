import {isLeaf} from "../../parser/CST/isLeaf";
import {reconstructTree, replaceChild} from "../../parser/CST/reconstructTree";
import {validateTree} from "../../parser/CST/validateTree";
import {ICST} from "../../_types/CST/ICST";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {IValidateCST} from "../../_types/CST/IValidateCST";

/*
    The groupRecoveryFeature generates a valid CST where recovery opening and closing brackets are generated at the extreme ends of the expressions (opening brackets at the start, closing brackets at the end).
    We can use some code that goes through the CST and obtains all other valid CSTs that could've been created by inserting the matching opening or closing bracket somewhere in the tree.

    Below are some observations and reasoning that helped in determining how to obtain all valid alternatives.

    First lets establish a standard for visualizing concrete syntax trees in pure ascii form. 
    A node will have the following structure:
    ```
    X [child1...child2...child3]
    ^ ^  ^        ^         ^  ^
    | |  |--------|---------|  |
    | |  children              |
    | |------------------------|
    | |
    | a set of children
    |
    operation description
    ```
    A child is either a terminal token, indicated by text surrounded by quotes - E.g. "(", or a node itself.
    We indicate nodes by specifying a # and drawing a line down to some syntax with the same shape as described above.
    Most node types are simply represented by the operator's symbol, E.g. *, -, or +
    But there are 2 special types to note: 
        - R which stands for a number (Real)
        - g which stands for a group, which is an expression surrounded by brackets, E.g. (2+3)
    
    So the expression (1+2)*3 would be represented as:
    ```
           * [#....."*".....#]
              |             |
      g ["("..#..")"]   R ["3"]
              |
      + [#..."+"...#]
         |         |
     R ["1"]   R ["2"]
    ```


    Some terminology:
       - Base node: A node generated from a CFG rule that's not left-recursive and has the highest possible precedence. This includes groups, numbers, and function calls.
       - Step node: A node generated from a CFG rule that's recursive with a specified precedence level

    Note that these nodes don't cover all possibilities (you can have non-recursive nodes with a specified precedence level), but all other nodes aren't relevant.

    Now we can recognize several properties of valid CSTs:
        1. inOrder: For a node X with children X1, X2, ..., Xn; if Xi occurs in X before Xj, then all syntax in the subtree of Xi must be ahead of the syntax in the subtree of Xj.
            The resulting plain-content (text that the tree was generated from) of a tree can be read by recursively traversing the nodes from left to right, performing an in-order tree walk. 
        2. increasingPrecedence: The children of a step node X can't have a lower precedence than X. Only base nodes can have children with a lower precedence level.
            For instance for the expression `1+2*3` we have the following tree:
            ```
              * [#....."+".....#]
                 |             |
             R ["1"]   + [#..."*"...#]   
                          |         |
                      R ["2"]   R ["3"]
            ```
            I.e. the addition node has a multiplication child node (and indeed the multiplication node has a higher precedence).
            The only way to get an addition node to be the child of a multiplication node, is to use brackets, which indeed is a base node (the `group` base node):
            `(1+2)*3`:
            ```
                   * [#....."*".....#]
                      |             |
              g ["("..#..")"]   R ["3"]
                      |
              + [#..."+"...#]
                 |         |
             R ["1"]   R ["2"]
            ```
        3. associativity: The right most child of a left-associative operator must have a strictly higher precedence than that of the operator, and vice-versa for right-associative operators.
            E.g. for the expression `1+2-3` you can't have the tree:
            ```
              * [#....."+".....#]
                 |             |
             R ["1"]   + [#..."-"...#]   
                          |         |
                      R ["2"]   R ["3"]
            ```
            Because subtraction has the same precedence as addition, and this operator should be left-associative, while this tree makes it right-associative. 
            One would have to use a group construct to make it right-associative, but this doesn't contradict any of the previously established properties.
        4. prefixPrecedence: Within the same priority level, prefix operators (nodes starting with a terminal token) can't be parents of infix nodes with the same precedence level.
            E.g. the following is invalid assuming `$` has the same precedence level as `-`:
            ```
              $ ["$"..#]
                      |
              + [#..."-"...#]   
                 |         |
             R ["2"]   R ["3"]
            ```
            This is mostly based on how we decided to handle prefix features in our CST parser, rather than being based on mathematical rules that we are aware of. 

    
    Approach: 
        Let's take the example expression `-1+2/3)*4` which would've been interpreted as `(-1+2/3)*4` and consider its syntax tree and how we could obtain valid alternative interpretations:
        ```
                     * [#....."*".....#]
                        |             |
                g ["("..#..")"]   R ["4"]
                        |                     
              + [#....."+".....#]   
                 |             |
         - ["-"..#]    / [#..."/"...#]
                 |        |         |
             R ["1"]  R ["2"]   R ["3"]
        ```
        Now we want to take the first (left-most) operation within the group, and move it out of the group. 
        To obtain the left-most operation we simply walk the left most branch of the subtree of the group, until we hit a token (based on property 1).
        If we do this in the example above, we will find the `-`. 
        We then select that token's first parent node that's right-recursive. Tn this case the `-` node itself. 
        A node like this can be safely moved up and down the syntax tree.

        Now remember how the first opening bracket wasn't actually there in the found syntax. So the actual found syntax tree looks more like this:
        ```
                     * [#....."*".....#]
                        |             |
                     g [#..")"]   R ["4"]
                        |                     
              + [#....."+".....#]   
                 |             |
         - ["-"..#]    / [#..."/"...#]
                 |        |         |
             R ["1"]  R ["2"]   R ["3"]
        ```
        So the key thing to observe is that we can move the `-` node up the tree, without affecting what the plain-content looked like:
        ```
                 * [#....."*".....#]
                    |             |
                 g [#..")"]   R ["4"]
                    |
            - ["-"..#]
                    |                     
          + [#....."+".....#]   
             |             |
         R ["1"]   / [#..."/"...#]
                      |         |
                  R ["2"]   R ["3"]
        ```
        We now should continue moving the `-` node up the tree, until it's at least above the group node, as this would represent having moved the operator out of the group.
        So the resulting tree would look like this:
        ```
                 * [#.."*"..#]
                    |       |
            - ["-"..#]  R ["4"]
                    |
                 g [#..")"]
                    |                     
          + [#....."+".....#]   
             |             |
         R ["1"]   / [#..."/"...#]
                      |         |
                  R ["2"]   R ["3"]
        ```
        Now if we act as if the `g` node did actually have the opening bracket, this CST would correspond to the following expression: `-(1+2/3)*4`.
        So we successfully moved one operation outside of the brackets, and we can continue doing this several times in a row.

        Additionally we have to make sure we respect property 2, 3 and 4 while moving nodes. So when moving `+` up the tree, we run into some trouble:
        ```
              * [#.."*"..#]
                 |       |
           ["-"..#]  R ["4"]
                 |            
          + [#.."+"..#]   
             |       |
         R ["1"]  g [#..")"]
                     |             
             / [#..."/"...#]
                |         |
            R ["2"]   R ["3"]
        ```
        Syntactically this is correct, the plain-content of the tree is unaffected by the move.
        Property 2 has been invalidated however, as the unary `-` operator has a higher precedence than addition. 

        To fix this, we can simply move the unary subtraction operator down the left-subtree of the addition node without interfering with the plain-content of the tree:
        ```
                  * [#....."*".....#]
                     |             |
            + [#...."+"....#]  R ["4"]   
               |           |
         ["-"..#]       g [#..")"]
               |           |             
           R ["1"]  / [#.."/"...#]
                       |        |
                   R ["2"]  R ["3"]
        ```
        And we then do a similar process once again, to move the addition operator on top of the multiplication (because of their precedences):
        ```
              + [#......"+".....#]   
                 |              |    
         - ["-"..#]   * [#....."*"....#]
                 |       |            |
             R ["1"]  g [#..")"]  R ["4"]
                         |             
                 / [#..."/"...#]
                    |         |
                R ["2"]   R ["3"]
        ```
        = `-1+(2/3)*4`

        Finally we can also move the division out of the group:
        ```
              + [#........"+"......#]   
                 |                 |    
         - ["-"..#]       * [#...."*"....#]
                 |           |           |
             R ["1"]  / [#.."/"..#]  R ["4"]
                         |       |
                     R ["2"]  g [#..")"]
                                 |
                             R ["3"]
        ```
        = `-1+2/(3)*4`

        And that's the general approach. We just have to make sure to take special care when running into cases where properties 3 and 4 apply.

        We can also repeat this process recursively when we have multiple recovered groups, in order to find the product of all possible corrections. 
        And we can take the symmetrically equivalent approach in order to solve missing closing brackets.
*/

/**
 * Generates all possible trees that could've been created given a subtree that contains group recovery nodes, excluding the given tree
 *
 * The passed subtree must have all recovery open brackets at the start of the expression for this to work
 * @param tree The tree to get all valid alternatives for
 * @param validate A function used to validate whether a given tree should be suggested
 * @returns A generator to obtain all valid options except the passed option
 */
export function* obtainAllAlternativeGroupOptions(
    tree: ICSTNode,
    validate?: IValidateCST<ICSTNode>[]
): Generator<ICSTNode> {
    let first = true;
    const generator = obtainAllPossibleGroupOptions(tree, validate);
    // The first tree that's returned is just the original tree
    for (let tree of generator) {
        if (!first) yield tree;
        first = false;
    }
}

/**
 * Generates all possible trees that could've been created given a subtree that contains group recovery nodes
 *
 * The passed subtree must have all recovery open brackets at the start of the expression for this to work
 * @param tree The tree to get all valid alternatives for
 * @param validate A function used to validate whether a given tree should be suggested
 * @param left Whether we are considering missing left-brackets, or right-brackets. Will automatically also consider right-brackets if left is supplied, but not vice-versa.
 * @returns A generator to obtain all valid options
 */
export function* obtainAllPossibleGroupOptions(
    tree: ICSTNode,
    validate?: IValidateCST<ICSTNode>[],
    left: boolean = true
): Generator<ICSTNode> {
    // If we're trying the left side trees, take the product with all right-side trees
    const otherSideTrees = left
        ? obtainAllPossibleGroupOptions(tree, validate, false)
        : [tree];

    for (let baseTree of otherSideTrees) {
        // Obtain the path to a recovery node
        const baseRecoveryPath: ICSTNode[] | undefined = findRecoveryGroup(
            baseTree,
            left
        );
        if (!baseRecoveryPath) {
            yield baseTree;
            continue;
        }

        const recoveryNode = baseRecoveryPath[baseRecoveryPath.length - 1];

        // Repeat the process for all options for subtrees
        const recoveryNodeChild = recoveryNode.children[1];
        if (isLeaf(recoveryNodeChild)) continue;
        const groupSubtrees = obtainAllPossibleGroupOptions(recoveryNodeChild, validate);
        subtree: for (let subtree of groupSubtrees) {
            let recoveryPath = reconstructTree(
                [...baseRecoveryPath, recoveryNodeChild],
                subtree
            ).slice(0, -1);

            yield recoveryPath[0];

            // Repeat as long s there is a right-recursive node in the group that can be moved out
            while (true) {
                if (!recoveryPath) continue subtree;
                const recoveryNode = recoveryPath[recoveryPath.length - 1];

                // Find the path to the left most right-recursive expression
                const subExp = recoveryNode.children[1];
                const edgeRecursivePath = findEdgeRecursiveNode(subExp as ICSTNode, left);
                if (!edgeRecursivePath) continue subtree;
                const edgeRecursiveNode = edgeRecursivePath[edgeRecursivePath.length - 1];

                // Insert the left most right recursive node into the right position within the recovery path
                const insertIndex = findCorrectPrecedenceLevelInPath(
                    recoveryPath,
                    edgeRecursiveNode
                );
                const newTree = insertInPath(
                    recoveryPath,
                    edgeRecursivePath,
                    insertIndex,
                    left
                );
                baseTree = newTree.tree;
                recoveryPath = newTree.recoveryGroupPath;

                const returnTree = validateTree(baseTree, recoveryPath, validate);
                if (returnTree && !isLeaf(returnTree)) yield returnTree;
            }
        }
    }
}

// Helper functions to make the main algorithm easier to read

/**
 * Finds the first recovery group in the tree
 * @param tree The tree to find the group in
 * @param left Whether we are considering missing left-brackets, or right-brackets
 * @returns Either the path to the group, or undefined
 */
export function findRecoveryGroup(
    tree: ICST,
    left: boolean = true
): ICSTNode[] | undefined {
    if (isLeaf(tree) || tree.children.length == 0) return undefined;
    const bracket = left ? tree.children[0] : tree.children[2];
    if (
        tree.type == "recoveryGroup" &&
        (!bracket || (isLeaf(bracket) && bracket.isRecovery))
    )
        return [tree];
    const childPath = findRecoveryGroup(
        tree.children[left ? 0 : tree.children.length - 1],
        left
    );
    return childPath ? [tree, ...childPath] : undefined;
}

/**
 * Finds the left most right recursive node or right most left recursive node if there is any (on a path where all nodes are recursive expressions)
 * @param tree The recovery group to search in
 * @param left Whether we are considering missing left-brackets, or right-brackets
 * @returns Either the path to the node, or undefined if no such node exists
 */
export function findEdgeRecursiveNode(
    tree: ICSTNode,
    left: boolean = true
): ICSTNode[] | undefined {
    if (tree.children.length == 0) return undefined;

    const firstChild = tree.children[0];
    const lastChild = getRightChild(tree);

    const edgeChild = left ? firstChild : lastChild;
    const recursiveChild = left ? lastChild : firstChild;

    const childResult =
        !edgeChild || isLeaf(edgeChild)
            ? undefined
            : findEdgeRecursiveNode(edgeChild, left);

    // If this isn't an expression node, it can't be part of a recursive path
    const isExpNode = isExpression(tree);
    if (!isExpNode) return undefined;

    // If the child is right recursive, this is the left-most right recursive path we can find
    if (childResult) return [tree, ...childResult];

    // If this node itself is right recursive (if it's the left most node) it's a valid path to return
    const isRecursive = recursiveChild && isExpression(recursiveChild);
    if (isRecursive) return [tree];

    // Otherwise no path could be found
    return undefined;
}

/**
 * Finds the correct location in the path to insert the given node at
 * @param path The path to look in
 * @param node The node to be inserted
 * @returns The index that the node should sit at
 */
export function findCorrectPrecedenceLevelInPath(
    path: ICSTNode[],
    node: ICSTNode
): number {
    const p = node.precedence!;
    const leftAssociative = !isRightAssociative(node);
    for (let i = path.length - 1; i >= 0; i--) {
        const pathNode = path[i];
        const np = pathNode.precedence!;
        if (np < p) return i + 1;
        if (np == p) {
            // Special case for property 3
            const leftRecursion = pathNode.children[0] == path[i + 1];
            if (leftRecursion == leftAssociative) return i + 1;
        }
    }
    return 0;
}

/**
 * Creates a new CST that represents the specified node being inserted at the specified index in the path
 * @param recoveryGroupPath The path for the node to be inserted in
 * @param nodePath The path from the recovery group to the node that should be moved
 * @param index The index for the node to be inserted at
 * @param left Whether we are considering missing left-brackets, or right-brackets
 * @returns The new subtree, and new path to the recovery group
 */
export function insertInPath(
    recoveryGroupPath: ICSTNode[],
    nodePath: ICSTNode[],
    index: number,
    left: boolean = true
): {tree: ICSTNode; recoveryGroupPath: ICSTNode[]} {
    // Find the children to insert into the left and right subtrees of the node
    const leftChildren: ICSTNode[] = [];
    const rightChildren: ICSTNode[] = [];
    for (let i = index; i < recoveryGroupPath.length - 1; i++) {
        const pNode = recoveryGroupPath[i];
        const nextPNode = recoveryGroupPath[i + 1];
        if (getRightChild(pNode) == nextPNode) leftChildren.push(pNode);
        else if (pNode.children[0] == nextPNode) rightChildren.push(pNode);
        else
            throw Error(
                "It should be impossible to be neither a left or right child and be on the path"
            );
    }

    // Create the new recovery group with the specified node being removed
    const group = recoveryGroupPath[recoveryGroupPath.length - 1];
    const node = nodePath[nodePath.length - 1];
    const newGroup = [group, ...nodePath.slice(0, -1)].reduceRight(
        ({orNode, newNode}, pathNode) => ({
            orNode: pathNode,
            newNode: replaceChild(pathNode, orNode, newNode),
        }),
        {orNode: node, newNode: left ? getRightChild(node)! : node.children[0]}
    ).newNode;

    // Assemble the left and right subtrees
    const leftTreeBase = (left ? node.children[0] : newGroup) as ICSTNode;
    const rightTreeBase = (left ? newGroup : getRightChild(node)!) as ICSTNode;
    const leftTree = leftChildren.reduceRight(
        ({newNode, path}, n) => {
            const nextNode = {...n, children: [...n.children.slice(0, -1), newNode]};
            return {newNode: nextNode, path: [nextNode, ...path]};
        },
        {newNode: leftTreeBase, path: [leftTreeBase]}
    );
    const rightTree = rightChildren.reduceRight(
        ({newNode, path}, n) => {
            const nextNode = {...n, children: [newNode, ...n.children.slice(1)]};
            return {newNode: nextNode, path: [nextNode, ...path]};
        },
        {newNode: rightTreeBase, path: [rightTreeBase]}
    );
    const sideTree = (left ? leftTree : rightTree).newNode;
    const pathTree = (left ? rightTree : leftTree).newNode;
    const insertionToGroupPath = (left ? rightTree : leftTree).path;

    // Create the new node to be inserted with the correct subtrees, and insert it in the path
    const newNode = {
        ...node,
        children: [
            left ? sideTree : pathTree,
            ...node.children.slice(1, -1),
            left ? pathTree : sideTree,
        ],
    };
    const newPath = recoveryGroupPath.slice(0, index).reduceRight(
        ({orNode, newNode, path}, pathNode) => {
            const nextNode = replaceChild(pathNode, orNode, newNode);
            return {
                orNode: pathNode,
                newNode: nextNode,
                path: [nextNode, ...path],
            };
        },
        {orNode: recoveryGroupPath[index], newNode, path: [newNode]}
    );
    return {
        tree: newPath.newNode,
        recoveryGroupPath: [...newPath.path, ...insertionToGroupPath],
    };
}

/**
 * Retrieves the right-most child of a given node
 * @param node The node to retrieve the child fork
 * @returns The found child if any
 */
export function getRightChild(node: ICSTNode): ICST | undefined {
    return node.children[node.children.length - 1];
}

// Guards
/**
 * Checks whether a given node is right associative
 * @param node The node to be checked
 * @returns Whether it's right associative
 */
export function isRightAssociative(node: ICSTNode): boolean {
    return node.associativity == "right";
}

/**
 * Checks whether a given node is an expression node
 * @param node The node to be checked
 * @returns Whether the node is an expression node
 */
export function isExpression(node: ICST): boolean {
    if (isLeaf(node)) return false;
    return node.precedence != undefined;
}
