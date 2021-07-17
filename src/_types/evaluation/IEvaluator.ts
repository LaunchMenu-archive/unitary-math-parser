import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {ITypeValidator} from "./ITypeValidator";
import {ITypeValidatorObject} from "./ITypeValidatorObject";
import {TEvaluatorDataFromTypeValidator} from "./TEvaluatorDataFromTypeValidator";

/** An evaluator that and the sub-expression type validators*/
export type IEvaluator<T extends Object = any, V extends TRecursiveValidator<T> = any> = {
    /** The validator data */
    validate: V;
    /** The evaluation function */
    evaluate: (node: T, context: EvaluationContext) => any;
};

export type TRecursiveValidator<T> = T extends Array<any>
    ? TMapValidatorArray<T>
    : T extends object
    ? TMapValidatorObject<T> | ITypeValidator<T>
    : never;

type TMapValidatorArray<T extends Array<any>> = T extends [infer F, ...infer R]
    ? [TRecursiveValidator<F>, ...TMapValidatorArray<R>]
    : TMapNonTupleValidatorArray<T>;

type TMapNonTupleValidatorArray<T extends Array<any>> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<TRecursiveValidator<U>>
    : T;

type TMapValidatorObject<O extends object> = {
    [K in keyof O]?: TRecursiveValidator<O[K]>;
};
