import {IUnitConfig} from "../../../features/util/number/_types/IUnitConfig";
import {ISimplifyConfig} from "./ISimplifyConfig";
import {IUnitaryNumber} from "./IUnitaryNumber";
import {IUnitDimensions as IUnitDimensions} from "./IUnitDimensions";
import {IUnitFormat} from "./IUnitFormat";

/** A data type to represent the unit of a number */
export type IUnit = IUnitFormat & {
    // Dimension checking
    /**
     * Retrieves the base dimensions of this unit
     * @returns The dimensions of this unit
     */
    getDimensions(): IUnitDimensions;
    /**
     * Checks whether the given unit has the same dimensions
     * @param unit The unit to compare to
     * @returns Whether the unit has the same dimension
     */
    hasSameDimensions(unit: IUnit): boolean;
    /**
     * Retrieves all dimensions mismatches of the given type
     * @param unit The unit to get the mismatches from
     * @returns All the mismatching dimensions
     */
    getDimensionsDifferentFrom(unit: IUnit): {
        extra: IUnitDimensions;
        missing: IUnitDimensions;
    };

    // Value manipulation
    /**
     * Converts a given number and its unit to this unit, assuming it's compatible
     * @param number The number to be converted
     * @param unit The original unit of the value
     * @returns Either undefined if dimensions aren't compatible, or the number expressed in this unit if they are
     */
    convert(number: number, unit: IUnit): number | undefined;

    // Unit manipulation
    /**
     * Removes units that are both in the nominator and denominators
     * @param config Additional simplification config
     * @returns The new unit with the same base dimensions
     */
    simplify(config?: ISimplifyConfig): IUnit;

    /**
     * Creates a new unit using the given numerator and denominator
     * @param unit The numerator and denominator
     * @param config An optional unit config
     * @returns The newly created unit
     */
    createNew(unit: IUnitFormat, config?: IUnitConfig): IUnit;

    // Util
    /**
     * Checks whether two units are equivalent
     * @param unit The unit to compare to
     * @param weak Whether to check if no conversion is needed, or to check if units are really expressed in the same way (no equivalent units used, or factors rearranged), defaults to false
     * @returns Whether the units are equivalent
     */
    equals(unit: IUnit, weak?: boolean): boolean;
};
