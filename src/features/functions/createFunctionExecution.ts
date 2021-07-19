import {IFunctionExecution} from "./_types/IFunctionExecution";

/**
 * Creates a new function execution
 * @param config The configuration for the function
 * @returns The function execution
 */
export function createFunctionExecution<T extends Array<object>>(
    config: IFunctionExecution<T>
): IFunctionExecution<T> {
    return config;
}
