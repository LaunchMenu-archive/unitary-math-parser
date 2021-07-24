import {IDataType} from "./IDataType";
import {IDataTypeAugmentation} from "./IDataTypeAugmentation";

/** The value of a data type */
export interface IValue<V = any> {
    /** A symbol representing the data type */
    type: symbol;
    /** The primary data of this type */
    data: V;
    /**
     * Retrieves the augmentation value for this node
     * @param augmentation The augmentation to retrieve
     * @returns The value stored for this augmentation
     */
    getAugmentation<A>(augmentation: IDataTypeAugmentation<V, A>): A;
    /**
     * Obtains a new value that represents this data value with the augmentation
     * @param augmentation The augmentation to target
     * @param value The value to store for the augmentation
     * @returns The new value with the augmentation
     */
    augment<A>(augmentation: IDataTypeAugmentation<V, A>, value: A): IValue<V>;
    /**
     * Retrieves all the augmentations that are specified in this value
     * @returns The list of augmentations that are present
     */
    getAugmentations(): IDataTypeAugmentation<V, any>[];
    /**
     * Checks whether this value is of the given data type
     * @param type The data type to be checked
     * @returns Whether this data is of the given type
     */
    isA<K>(type: IDataType<K>): this is IValue<K>;
    /** @override */
    toString(): string;
}
