import {IDimension} from "../../../_types/evaluation/number/IDimension";
import {IPureUnit} from "../../../_types/evaluation/number/IPureUnit";
import {IDimensionConfig} from "./_types/IDimensionConfig";

/**
 * Creates a new dimension according to the passed config
 * @param config The configuration for the dimension
 * @returns A tuple of the dimension and the base unit of the dimension
 */
export function createDimension({
    name,
    priority,
    unit: {name: unitName, alias, equivalent},
}: IDimensionConfig): [IDimension, IPureUnit] {
    const dimension: IDimension = {
        name,
        priority,
        parentUnit: equivalent,
        baseUnit: null as any,
    };
    const unit: IPureUnit = {
        dimension,
        identifier: {
            name: unitName,
            alias: alias ?? [],
        },
    };
    dimension.baseUnit = unit;
    return [dimension, unit];
}
