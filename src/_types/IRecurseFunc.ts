import {IASTBase} from "./AST/IASTBase";
import {IASTExpression} from "./AST/IASTExpression";
import {TGetPlainAST} from "./AST/TGetPlainAST";
import {TGetReductionASTNode} from "./AST/TGetReductionASTNode";
import {IFeatureSyntax} from "./IFeatureSyntax";

/**
 * The object with the recursion function
 */
export type IRecurseFunc<T extends IFeatureSyntax> = {
    /**
     * Performs the recursion for this node type
     * @param tree The tree obtained from this feature to recurse on
     * @param recurse The recursion function to get the result of the children
     * @returns The reduction node
     */
    recurse<O>(
        tree: TGetPlainAST<IASTBase<T["name"], T["AST"]>>,
        recurse: (node: IASTBase) => O
    ): TGetReductionASTNode<IASTBase<T["name"], T["AST"]>, O>;
};

/** The object with the recursion function, if a recursion function is required */
export type IOptionalRecurseFunc<T extends IFeatureSyntax> =
    T["AST"] extends IASTExpression ? unknown : IRecurseFunc<T>;
