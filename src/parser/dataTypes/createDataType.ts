import {IDataType} from "./_types/IDataType";
import {IDataTypeAugmentation} from "./_types/IDataTypeAugmentation";
import {IValue} from "./_types/IValue";

/**
 * Creates a new data type
 * @param name The name of the data type
 * @returns The created data type
 */
export function createDataType<V>(name: string): IDataType<V> {
    const type = Symbol(name);

    const dataType: IDataType<V> = {
        name,
        type,
        create(data, parent) {
            if (!parent) return createValue(data, dataType, {});

            const augmentations = new Set<IDataTypeAugmentation<V, any>>();
            parent.values.forEach(value =>
                value.getAugmentations().forEach(augmentations.add, augmentations)
            );

            // Merge all default augmentation data
            const augmentationData: IAugmentationMap<V> = {};
            for (let augmentation of augmentations) {
                const values = parent.values.map(value => ({
                    augmentation: value.getAugmentation(augmentation),
                    all: value,
                }));
                const augmentationResult = augmentation.merge(values, data, parent.node);
                augmentationData[augmentation.identifier as any] = {
                    augmentation,
                    value: augmentationResult.augmentation,
                };
                if (augmentationResult.value != undefined)
                    data = augmentationResult.value;
            }

            return createValue(data, dataType, augmentationData);
        },
    };
    return dataType;
}

type IAugmentationMap<V> = Record<
    any,
    {
        value: any;
        augmentation: IDataTypeAugmentation<V, any>;
    }
>;

/**
 * Constructs the item of the data type
 * @param value The pure value itself
 * @param dataType The data type of the value
 * @param augmentations The augmentations of the value
 * @returns The data type value itself
 */
function createValue<V>(
    value: V,
    dataType: IDataType<V>,
    augmentations: IAugmentationMap<V>
): IValue<V> {
    const item: IValue<V> = {
        type: dataType.type,
        data: value,
        augment: <A>(augmentation: IDataTypeAugmentation<V, A>, augValue: A): IValue<V> =>
            createValue(value, dataType, {
                ...augmentations,
                [augmentation.identifier as any]: {value: augValue, augmentation},
            }),
        getAugmentation: <A>(augmentation: IDataTypeAugmentation<V, A>): A => {
            if (!(augmentation.identifier in augmentations))
                augmentations[augmentation.identifier as any] = {
                    augmentation,
                    value: augmentation.init(value, item),
                };
            return augmentations[augmentation.identifier as any].value;
        },
        getAugmentations: () =>
            Object.getOwnPropertySymbols(augmentations).map(
                sym => augmentations[sym as any].augmentation
            ),
        isA: <T>({type}: IDataType<T>) => type == dataType.type,
    };
    return item;
}
