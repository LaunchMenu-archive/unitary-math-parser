import {IPureUnit} from "../../../_types/evaluation/number/IPureUnit";
import {TMapArray} from "../../../_types/TMapArray";
import {IFactorUnitConfig} from "./_types/IFactorUnitConfig";

/**
 * Creates a set of pure units based on the given relation between them
 * @param base The base unit to start from
 * @param factors The factors needed to arrive to the next unit
 */
export function createFactoredUnits<T extends IFactorUnitConfig[]>(
    base: IPureUnit,
    factors: T
): TMapArray<T, IFactorUnitConfig, IPureUnit> {
    let total = 1;
    const units = factors.map<IPureUnit>(({factor, name, alias}) => {
        const unitToBaseFactor = (total = total * factor);
        return {
            dimension: base.dimension,
            identifier: {name, alias: alias ?? []},
            parent: {
                convertTo: v => v * unitToBaseFactor,
                convertFrom: v => v / unitToBaseFactor,
                unit: base,
            },
        };
    });
    return units as any;
}
