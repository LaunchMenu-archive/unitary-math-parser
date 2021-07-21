import {IDataTypeAugmentation} from "./_types/IDataTypeAugmentation";

/**
 * Creates a new augmentation for a data type
 * @param config The configuration for the augmentation
 * @returns The augmentation
 */
export function createDataTypeAugmentation<V, A>({
    name,
    ...config
}: {name: string} & Omit<
    IDataTypeAugmentation<V, A>,
    "identifier"
>): IDataTypeAugmentation<V, A> {
    const identifier = Symbol(name);
    return {
        identifier,
        ...config,
    };
}
