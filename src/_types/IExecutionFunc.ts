import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTBase} from "./AST/IASTBase";
import {IASTExpression} from "./AST/IASTExpression";
import {IRecursive} from "./AST/IRecursive";
import {TGetPlainAST} from "./AST/TGetPlainAST";
import {TGetReductionASTNode} from "./AST/TGetReductionASTNode";
import {TIsRecursiveNode} from "./AST/TMakeASTRecursive";
import {IEvaluator} from "./evaluation/IEvaluator";
import {ITypeValidator} from "./evaluation/ITypeValidator";
import {IFeatureSyntax} from "./IFeatureSyntax";

/**
 * The object with the recursion function
 */
export type IExecutionFuncs<T extends IFeatureSyntax> = {
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

    /** All the evaluators that this operator can work on given different sub-expressions */
    evaluate:
        | TIsRecursiveNode<T["AST"], never, IEvaluator<any, any>[]>
        | {
              /**
               * Evaluates the given expression, and deals with type errors, handles recursion, etc.
               * @param tree The tree to be evaluated
               * @param recurse The function to recurse on sub-expressions
               * @returns The result of the expression
               **/
              (
                  tree: IASTBase<T["name"], T["AST"]>,
                  recurse: (node: IASTBase, context: EvaluationContext) => Object
              ): Object;
          };
};

/** The object with the recursion function, if a recursion function is required */
export type IOptionalExecutionFuncs<T extends IFeatureSyntax> =
    T["AST"] extends IASTExpression ? unknown : IExecutionFuncs<T>;
