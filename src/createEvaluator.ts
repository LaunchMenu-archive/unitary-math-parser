import {EvaluationContext} from "./parser/AST/EvaluationContext";
import {IASTBase} from "./_types/AST/IASTBase";
import {IEvaluator, TRecursiveValidator} from "./_types/evaluation/IEvaluator";

/**
 * Creates a new evaluator
 * @param validate The data to validate whether the result is what we expect
 * @param evaluate Evaluates the data when of the correct shape
 * @returns The evaluator that was created
 */
export function createEvaluator<
    T extends Object & Partial<IASTBase>,
    V extends TRecursiveValidator<T>
>(validate: V, evaluate: (node: T, context: EvaluationContext) => any): IEvaluator<T, V> {
    return {validate, evaluate};
}
