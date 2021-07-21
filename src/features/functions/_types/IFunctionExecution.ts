import {IDataType} from "../../../parser/dataTypes/_types/IDataType";
import {IValue} from "../../../parser/dataTypes/_types/IValue";
import {IASTBase} from "../../../_types/AST/IASTBase";
import {IEvaluationErrorObject} from "../../../_types/evaluation/IEvaluationErrorObject";

/**The execution for a given function */
export type IFunctionExecution<T extends Array<IValue> = Array<IValue>, K = any> = {
    /** The name of the function */
    name: string;
    /** The type checks for this function execution */
    check: TMapArray<T>;
    /** Executes the function */
    exec(
        args: T,
        node: IASTBase
    ): IEvaluationErrorObject | IValue<K> | {type: IDataType<K>; value: K};
};

export type IFunctionArgValidation<T extends Object> =
    | IDataType<T>
    | {
          /** Checks whether the data type corresponds */
          type: IDataType<T>;
          /** Performs an additional check on the value, returns a description of the expected value if the supplied value isn't allowed.
           * E.g. when expecting odd numbers:
           * ```ts
           * (n: number)=>n%2==0?"odd number":undefined
           * ```
           */
          value?: (arg: T) => string | undefined;
      };

type TMapArray<T extends Array<IValue>> = T extends [infer F, ...infer R]
    ? R extends Array<IValue>
        ? [F extends IValue<infer U> ? IFunctionArgValidation<U> : F, ...TMapArray<R>]
        : TMapNonTupleArray<T>
    : TMapNonTupleArray<T>;

type TMapNonTupleArray<T extends Array<IValue>> = T extends []
    ? T
    : T extends Array<IValue<infer U>>
    ? Array<IFunctionArgValidation<U>>
    : T;
