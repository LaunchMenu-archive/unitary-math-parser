import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {IDataType} from "../../parser/dataTypes/_types/IDataType";
import {IValue} from "../../parser/dataTypes/_types/IValue";
import {IEvaluationErrorObject} from "./IEvaluationErrorObject";

/** An evaluator that and the sub-expression type validators*/
export type IEvaluator<T extends Object = any, V extends TRecursiveValidator<T> = any> = {
    /** The validator data */
    validate: V;
    /** The evaluation function */
    evaluate: (node: T, context: EvaluationContext) => IEvaluationErrorObject | IValue;
};

export type TRecursiveValidator<T> = T extends Array<any>
    ? TMapValidatorArray<T>
    : T extends IValue<infer U>
    ? IDataType<U>
    : T extends object
    ? TMapValidatorObject<T>
    : never;

export type TMapValidatorArray<T extends Array<any>> = T extends [infer F, ...infer R]
    ? [TRecursiveValidator<F>, ...TMapValidatorArray<R>]
    : TMapNonTupleValidatorArray<T>;

export type TMapNonTupleValidatorArray<T extends Array<any>> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<TRecursiveValidator<U>>
    : T;

export type TMapValidatorObject<O extends object> = {
    [K in keyof O]?: TRecursiveValidator<O[K]>;
};
