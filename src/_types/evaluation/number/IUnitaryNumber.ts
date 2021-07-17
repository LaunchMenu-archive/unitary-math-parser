import {IUnit} from "./IUnit";

/** A number type that includes a unit */
export type IUnitaryNumber = {
    /** The result value */
    value: number;
    /** The unit of the number */
    unit: IUnit;
    /** Whether this is purely a unit (with standard value 1) */
    isUnit?: boolean;
    /** A function to convert it to a string */
    toString: () => string;
};
