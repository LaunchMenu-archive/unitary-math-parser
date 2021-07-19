import {ITypeValidator} from "../../../_types/evaluation/ITypeValidator";

/**The execution for a given function */
export type IFunctionExecution<T extends Array<object> = Array<object>> = {
    /** The name of the function */
    name: string;
    /** The type checks for this function execution */
    check: TMapArray<T>;
    /** Executes the function */
    exec(...args: T): any;
};

export type IFunctionArgValidation<T extends Object> =
    | ITypeValidator<T>
    | {
          /** Checks whether the data type corresponds */
          type: ITypeValidator<T>;
          /** Performs an additional check on the value, returns a description of the expected value if the supplied value isn't allowed.
           * E.g. when expecting odd numbers:
           * ```ts
           * (n: number)=>n%2==0?"odd number":undefined
           * ```
           */
          value?: (arg: T) => string | undefined;
      };

type TMapArray<T extends Array<any>> = T extends [infer F, ...infer R]
    ? [IFunctionArgValidation<F>, ...TMapArray<R>]
    : TMapNonTupleArray<T>;

type TMapNonTupleArray<T extends Array<any>> = T extends []
    ? T
    : T extends Array<infer U>
    ? Array<IFunctionArgValidation<U>>
    : T;
