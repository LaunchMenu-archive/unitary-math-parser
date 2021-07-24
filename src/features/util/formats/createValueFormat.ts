import {IValueFormat} from "./_types/IValueFormat";

/**
 * Creates a new value format
 * @param config The configurations of the format
 * @returns The created format
 */
export function createValueFormat<V>(
    config: Omit<IValueFormat<V>, "identifier"> & {name: string}
): IValueFormat<V> {
    return {
        identifier: Symbol(config.name),
        ...config,
    };
}
