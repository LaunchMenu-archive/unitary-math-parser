import {IValue} from "../../parser/dataTypes/_types/IValue";
import {IFunctionExecution} from "./_types/IFunctionExecution";

/**
 * Creates a new function execution
 * @param config The configuration for the function
 * @returns The function execution
 */
export function createFunctionExecution<T extends Array<IValue>, K>(
    config: IFunctionExecution<T, K>
): IFunctionExecution<T, K> {
    return config;
}
