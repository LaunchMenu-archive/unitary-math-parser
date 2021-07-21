import {IASTBase} from "../../../_types/AST/IASTBase";
import {IValue} from "./IValue";

/** An augmentation for a data type in order to track extra data */
export type IDataTypeAugmentation<V, A> = {
    /** The identifier of this augmentation */
    identifier: symbol;
    /**
     * Retrieves the augmentation of a value if none was provided
     * @param value The value that the augmentation is for
     * @param item The complete item
     * @returns The augmentation value
     */
    init(value: V, item: IValue<V>): A;
    /**
     * Retrieves the augmentation of a value when merging multiple nodes
     * @param values The augmentation values that the subnodes had
     * @param value The primary value of the node
     * @param node The entire node that the value is for and that subvalues came from
     * @returns Both the augmentation value and optionally a new primary value
     */
    merge(
        values: {augmentation: A; all: IValue<V>}[],
        value: V,
        node: IASTBase
    ): {augmentation: A; value?: V};
};
