import {IASTBase} from "../../../_types/AST/IASTBase";
import {IValue} from "./IValue";

/** A data type that a value returned from the parser can have */
export type IDataType<V> = {
    /** The name of the data type */
    name: string;
    /** A symbol representing the data type */
    type: symbol;
    /**
     * Creates a new value of this type
     * @param data The primary value data
     * @param parent The data that the value got created from
     * @returns The data type
     */
    create(
        data: V,
        parent?: {
            /** The node that this value originates from */
            node: IASTBase;
            /** The values that this value was obtained from */
            values: IValue<V>[];
        }
    ): IValue<V>;
};
