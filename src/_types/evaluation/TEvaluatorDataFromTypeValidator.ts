import {ITypeValidator} from "./ITypeValidator";
import {ITypeValidatorObject} from "./ITypeValidatorObject";

/** Transforms the validator object to the data passed to the evaluator */
export type TEvaluatorDataFromTypeValidator<T extends ITypeValidatorObject> = {
    [K in keyof T]: T[K] extends ITypeValidator<infer V> ? V : T[K];
};
