import {IPureUnit} from "./IPureUnit";
import {IUnit} from "./IUnit";

/** The dimension that a unit belongs to */
export type IDimension = {
    /** The default base unit for this dimension */
    baseUnit: IPureUnit;
    /** The name of the dimension */
    name: string;
    /** The priority number of the dimension, used for sorting. Higher number => further to the left */
    priority: number;
    /** An optional parent unit that this base unit is equivalent to (without value conversion) */
    parentUnit?: IUnit;
};
