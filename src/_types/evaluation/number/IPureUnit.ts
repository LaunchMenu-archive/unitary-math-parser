import {IDimension} from "./IDimension";
import {IUnitIdentifier} from "./IUnitIdentifier";

/** The pure units that bigger units are built up from, using multiplication and division */
export type IPureUnit = {
    /** The dimension of the unit */
    dimension: IDimension;
    /** The identifier for the unit */
    identifier: IUnitIdentifier;
    /** The parent unit to be used for unit conversion, or undefined if this is the base unit of the dimension */
    parent?: {
        /**
         * Converts the passed number with the parent's unit to this unit
         * @param value The number to be converted
         * @returns The same value when expressed in the parent unit
         */
        convertFrom(value: number): number;
        /**
         * Converts the passed number with this unit to the parent's unit
         * @param value The number to be converted
         * @returns The same value when expressed in this unit
         */
        convertTo(value: number): number;
        /**
         * Converts the passed number with the parent's unit to this unit, given that the unit is part of the denominator
         * @param value The number to be converted
         * @returns The same value when expressed in the parent unit
         */
        convertDenominatorFrom?(value: number): number;
        /**
         * Converts the passed number with this unit to the parent's unit, given that the unit is part of the denominator
         * @param value The number to be converted
         * @returns The same value when expressed in this unit
         */
        convertDenominatorTo?(value: number): number;

        /** The parent unit which is closer to the base unit of a dimension, or even the base unit of the dimension by just passing the dimension */
        unit: IPureUnit;
    };
};
