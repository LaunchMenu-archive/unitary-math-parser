import {IDimension} from "../../../_types/evaluation/number/IDimension";
import {ILabeledPureUnit} from "../../../_types/evaluation/number/ILabeledPureUnit";
import {IPureUnit} from "../../../_types/evaluation/number/IPureUnit";
import {ISimplifyConfig} from "../../../_types/evaluation/number/ISimplifyConfig";
import {IUnit} from "../../../_types/evaluation/number/IUnit";
import {IUnitDimensions} from "../../../_types/evaluation/number/IUnitDimensions";
import {IUnitFormat} from "../../../_types/evaluation/number/IUnitFormat";
import {IToBaseDimensionsOutput} from "./_types/IToBaseDimensionsOutput";
import {IUnitConfig} from "./_types/IUnitConfig";

/** A class to represent units of a number */
export class Unit implements IUnit {
    /** The base units at the numerator side */
    public readonly numerator: (IPureUnit | ILabeledPureUnit)[];
    /** The base units at the denominator side */
    public readonly denominator: (IPureUnit | ILabeledPureUnit)[];

    /**
     * Creates a new unit
     * @param numerator The pure units on the numerator side
     * @param denominator The pure units on the denominator side
     * @param config The unit config
     */
    public constructor(
        numerator: (IPureUnit | ILabeledPureUnit)[],
        denominator: (IPureUnit | ILabeledPureUnit)[],
        {sortUnits}: IUnitConfig = {}
    ) {
        this.numerator = [...numerator];
        this.denominator = [...denominator];

        if (sortUnits) {
            this.sortUnits(this.numerator);
            this.sortUnits(this.denominator);
        }
    }

    // Unit manipulation
    /**
     * Creates a new unit from the given config
     * @param unit THe unit format
     * @param config Optional extra configuration
     * @returns The new unit
     */
    public createNew(unit: IUnitFormat, config?: IUnitConfig): IUnit {
        return new Unit(unit.numerator, unit.denominator, config);
    }

    /**
     * Removes units that are both in the nominator and denominators
     * @param config Additional simplification config
     * @returns The new unit with the same base dimensions
     */
    public simplify({
        convertUnits = true,
        expandUnitsToCancelOut = false,
        expandUnits = false,
    }: ISimplifyConfig = {}): IUnit {
        let unit = this.cancelOutUnits(this);

        // Try to expand units for simplification
        if (expandUnitsToCancelOut || expandUnits) {
            const {unit: newUnit, encounteredDerivedUnits} = this.toBaseDimensions(unit);
            unit = this.cancelOutUnits(newUnit);
            if (!expandUnits)
                for (let {inDenominator, unit: condenseUnit} of encounteredDerivedUnits)
                    unit = this.condenseUnit(unit, condenseUnit, inDenominator);
        }

        // Put all factors on the same unit as one and another
        if (convertUnits) unit = this.convertFactorsToSameUnit(unit);

        return new Unit(unit.numerator, unit.denominator);
    }

    /**
     * Converts all factors in a unit to be consistent with the first term of that unit, and also moves it to behind that unit
     * @param unit The unit to convert factors in
     * @returns The resulting unit
     */
    protected convertFactorsToSameUnit(unit: IUnitFormat): IUnitFormat {
        const numerator: (IPureUnit | ILabeledPureUnit)[] = [];
        const denominator: (IPureUnit | ILabeledPureUnit)[] = [];

        for (let [target, source] of [
            [numerator, unit.numerator],
            [denominator, unit.denominator],
        ]) {
            source.forEach(labeledUnit => {
                const dim = getUnit(labeledUnit).dimension;
                const index = target.findIndex(u => getUnit(u).dimension == dim);
                if (index == -1) target.push(labeledUnit);
                else target.splice(index + 1, 0, target[index]);
            });
        }

        return {numerator, denominator};
    }

    /**
     * Tries to replace units by the condensation pure unit, if possible
     * @param unit The unit to be condensed
     * @param condensation The condensation attempt
     * @param inDenominator Whether the condensation should be in the denominator
     * @returns The remaining unit
     */
    protected condenseUnit(
        unit: IUnitFormat,
        condensation: IPureUnit | ILabeledPureUnit,
        inDenominator: boolean = false
    ): IUnitFormat {
        const parentUnit = getUnit(condensation).dimension.parentUnit;
        if (!parentUnit) return unit;

        const numerator = [...unit.numerator];
        const denominator = [...unit.denominator];

        let numeratorTarget = inDenominator ? denominator : numerator;
        for (let num of parentUnit.numerator) {
            const numDim = getUnit(num).dimension;
            const index = numeratorTarget.findIndex(
                unit => getUnit(unit).dimension == numDim
            );
            if (index == -1) return unit;
            numeratorTarget.splice(index, 1);
        }

        let denominatorTarget = inDenominator ? numerator : denominator;
        for (let den of parentUnit.denominator) {
            const denDim = getUnit(den).dimension;
            const index = denominatorTarget.findIndex(
                unit => getUnit(unit).dimension == denDim
            );
            if (index == -1) return unit;
            denominatorTarget.splice(index, 1);
        }

        numeratorTarget.push(condensation);

        return {numerator, denominator};
    }

    /**
     * Cancels out any units that have the same dimensions in the numerator and denominator
     * @param unit The unit to cancel out in
     * @returns The remaining units
     */
    protected cancelOutUnits(unit: IUnitFormat): IUnitFormat {
        const numerator = [...unit.numerator];
        const denominator = [...unit.denominator];

        // TODO: handle derived units
        // TODO: handle converting units of the same dimension to be the same unit
        for (let i = numerator.length - 1; i >= 0; i--) {
            const pureUnit = numerator[i];
            const dimension = getUnit(pureUnit).dimension;
            const denominatorIndex = denominator.findIndex(
                unit => getUnit(unit).dimension == dimension
            );
            if (denominatorIndex != -1) {
                numerator.splice(i, 1);
                denominator.splice(denominatorIndex, 1);
            }
        }

        return {numerator, denominator};
    }

    /**
     * Retrieves the same unit in the base dimensions (replacing any derived dimension such as power)
     * @param unit The unit to get the base dimensions form of
     * @returns The same unit in the base dimensions, and the expanded derived units
     */
    protected toBaseDimensions(unit: IUnitFormat): IToBaseDimensionsOutput {
        const numerator = [] as (IPureUnit | ILabeledPureUnit)[];
        const denominator = [] as (IPureUnit | ILabeledPureUnit)[];
        const derived = [] as IToBaseDimensionsOutput["encounteredDerivedUnits"];

        unit.numerator.forEach(unit => {
            const parentUnit = getUnit(unit).dimension.parentUnit;
            if (parentUnit) {
                const {
                    unit: {numerator: n, denominator: d},
                    encounteredDerivedUnits,
                } = this.toBaseDimensions(parentUnit);
                n.forEach(unit => numerator.push(unit));
                d.forEach(unit => denominator.push(unit));
                derived.push(...encounteredDerivedUnits);
                derived.push({inDenominator: false, unit});
            } else {
                numerator.push(unit);
            }
        });

        unit.denominator.forEach(unit => {
            const parentUnit = getUnit(unit).dimension.parentUnit;
            if (parentUnit) {
                const {
                    unit: {numerator: n, denominator: d},
                    encounteredDerivedUnits,
                } = this.toBaseDimensions(parentUnit);
                n.forEach(unit => denominator.push(unit));
                d.forEach(unit => numerator.push(unit));
                derived.push(
                    ...encounteredDerivedUnits.map(({inDenominator, unit}) => ({
                        inDenominator: !inDenominator,
                        unit,
                    }))
                );
                derived.push({inDenominator: true, unit});
            } else {
                denominator.push(unit);
            }
        });

        return {unit: new Unit(numerator, denominator), encounteredDerivedUnits: derived};
    }

    /**
     * Sorts the given units in place in accordance to the dimension priorities
     * @param units The units to sorts
     * @returns The sorted units
     */
    protected sortUnits(
        units: (IPureUnit | ILabeledPureUnit)[]
    ): (IPureUnit | ILabeledPureUnit)[] {
        return units.sort((a, b) =>
            compareDimensions(getUnit(a).dimension, getUnit(b).dimension) ? -1 : 1
        );
    }

    // Dimension checking
    /**
     * Retrieves the  dimension of this unit
     * @returns The dimensions of this unit
     */
    public getDimensions(): IUnitDimensions {
        const result: IUnitDimensions = {
            numerator: [],
            denominator: [],
        };

        function insert(item: IDimension, denominator: boolean = false): void {
            const [targetList, oppositeList] = denominator
                ? [result.denominator, result.numerator]
                : [result.numerator, result.denominator];

            const oppositeIndex = oppositeList.indexOf(item);
            if (oppositeIndex !== -1) oppositeList.splice(oppositeIndex, 1);
            else {
                const insertIndex = targetList.findIndex(pi =>
                    compareDimensions(pi, item)
                );
                targetList.splice(
                    insertIndex == -1 ? targetList.length : insertIndex,
                    0,
                    item
                );
            }
        }

        // Add all dimensions from the numerator units
        for (let pureUnit of this.numerator) {
            const dimension = getUnit(pureUnit).dimension;
            if (dimension.parentUnit) {
                const {numerator: n, denominator: d} =
                    dimension.parentUnit.getDimensions();
                n.forEach(numerator => insert(numerator));
                d.forEach(denominator => insert(denominator, true));
            } else {
                insert(dimension);
            }
        }

        // Add all dimensions from the denominator units
        for (let pureUnit of this.denominator) {
            const dimension = getUnit(pureUnit).dimension;
            if (dimension.parentUnit) {
                const {numerator: n, denominator: d} =
                    dimension.parentUnit.getDimensions();
                n.forEach(numerator => insert(numerator, true));
                d.forEach(denominator => insert(denominator));
            } else {
                insert(dimension, true);
            }
        }

        return result;
    }

    /**
     * Checks whether the given unit has the same dimensions
     * @param unit The unit to compare to
     * @returns Whether the unit has the same dimension
     */
    public hasSameDimensions(unit: IUnit): boolean {
        const thisDimensions = this.getDimensions();
        const unitDimensions = unit.getDimensions();

        if (
            thisDimensions.numerator.length != unitDimensions.numerator.length ||
            thisDimensions.denominator.length != unitDimensions.denominator.length
        )
            return false;

        for (let i = 0; i < thisDimensions.numerator.length; i++)
            if (thisDimensions.numerator[i] != unitDimensions.numerator[i]) return false;

        for (let i = 0; i < thisDimensions.denominator.length; i++)
            if (thisDimensions.denominator[i] != unitDimensions.denominator[i])
                return false;

        return true;
    }

    /**
     * Retrieves all dimensions mismatches of the given type
     * @param unit The unit to get the mismatches from
     * @returns All the mismatching dimensions
     */
    public getDimensionsDifferentFrom(unit: IUnit): {
        extra: IUnitDimensions;
        missing: IUnitDimensions;
    } {
        // Convert both this and the comparison unit to base dimensions
        let {unit: thisInBase, encounteredDerivedUnits: encounteredDerivedThisUnits} =
            this.toBaseDimensions(this);
        let {unit: unitInBase, encounteredDerivedUnits} = this.toBaseDimensions(unit);

        // Cancel out all units with the same dimensions in numerator and denominator
        function removeCommon(
            target: (ILabeledPureUnit | IPureUnit)[],
            source: (ILabeledPureUnit | IPureUnit)[]
        ): (ILabeledPureUnit | IPureUnit)[] {
            source = [...source];
            return target.filter(labeledUnit => {
                const unit = getUnit(labeledUnit);
                const index = source.findIndex(
                    u => getUnit(u).dimension == unit.dimension
                );
                if (index != -1) {
                    source.splice(index, 1);
                    return false;
                }
                return true;
            });
        }
        let remainingThis = {
            numerator: removeCommon(thisInBase.numerator, unitInBase.numerator),
            denominator: removeCommon(thisInBase.denominator, unitInBase.denominator),
        };
        let remainingUnit = {
            numerator: removeCommon(unitInBase.numerator, thisInBase.numerator),
            denominator: removeCommon(unitInBase.denominator, thisInBase.denominator),
        };

        // Recondense any units if possible
        for (let {inDenominator, unit: condenseUnit} of encounteredDerivedUnits)
            remainingUnit = this.condenseUnit(remainingUnit, condenseUnit, inDenominator);
        for (let {inDenominator, unit: condenseUnit} of encounteredDerivedThisUnits)
            remainingThis = this.condenseUnit(remainingThis, condenseUnit, inDenominator);

        // Obtain the dimensions
        return {
            missing: {
                numerator: remainingUnit.numerator.map(unit => getUnit(unit).dimension),
                denominator: remainingUnit.denominator.map(
                    unit => getUnit(unit).dimension
                ),
            },
            extra: {
                numerator: remainingThis.numerator.map(unit => getUnit(unit).dimension),
                denominator: remainingThis.denominator.map(
                    unit => getUnit(unit).dimension
                ),
            },
        };
    }

    // Value manipulation
    /**
     * Converts a given number and its unit to this unit, assuming it's compatible
     * @param number The number to be converted
     * @param unit The original unit of the value
     * @returns Either undefined if dimensions aren't compatible, or the number expressed in this unit if they are compatible
     */
    public convert(number: number, unit: IUnit): number | undefined {
        if (!unit.hasSameDimensions(this)) return;

        // Get the value expressed in the base units of the dimensions of this unit
        const baseValue = this.valueToBase(number, unit);
        const newValue = this.baseToValue(baseValue, this);
        return newValue;
    }

    /**
     * Converts the given value in the given unit to the same value in the base unit
     * @param value The value to convert
     * @param unit The unit the value is in
     * @returns The value in the base unit
     */
    protected valueToBase(value: number, unit: IUnit): number {
        let numerator = value;
        for (let numeratorUnit of unit.numerator)
            numerator = this.pureUnitValueToBase(numerator, getUnit(numeratorUnit));

        let denominator = 1;
        for (let denominatorUnit of unit.denominator)
            denominator = this.pureUnitValueToBase(
                denominator,
                getUnit(denominatorUnit),
                true
            );

        return numerator / denominator;
    }

    /**
     * Converts the given value in the given unit to the same value in the base unit
     * @param value The value to convert
     * @param unit The unit the value is in
     * @param denominator Whether the unit is on the denominator side
     * @returns The value in the base unit
     */
    protected pureUnitValueToBase(
        value: number,
        unit: IPureUnit,
        denominator: boolean = false
    ): number {
        if (unit.parent) {
            const convertTo =
                (denominator ? unit.parent.convertDenominatorTo : null) ??
                unit.parent.convertTo;
            return this.pureUnitValueToBase(convertTo(value), unit.parent.unit);
        } else if (unit.dimension.parentUnit) {
            return this.valueToBase(value, unit.dimension.parentUnit);
        } else {
            return value;
        }
    }

    /**
     * Converts the given value in the base unit to the same value in the given unit
     * @param value The value to convert
     * @param unit The unit to convert to
     * @returns The value in the given unit
     */
    protected baseToValue(value: number, unit: IUnit): number {
        let numerator = value;
        for (let numeratorUnit of unit.numerator)
            numerator = this.baseToPureUnitValue(numerator, getUnit(numeratorUnit));

        let denominator = 1;
        for (let denominatorUnit of unit.denominator)
            denominator = this.baseToPureUnitValue(
                denominator,
                getUnit(denominatorUnit),
                true
            );

        return numerator / denominator;
    }

    /**
     * Converts the given value in the base unit to the same value in the given unit
     * @param value The value to convert
     * @param unit The unit to convert to
     * @param denominator Whether the unit is on the denominator side
     * @returns The value in the given unit
     */
    protected baseToPureUnitValue(
        value: number,
        unit: IPureUnit,
        denominator: boolean = false
    ): number {
        if (unit.parent) {
            const convertFrom =
                (denominator ? unit.parent.convertDenominatorFrom : null) ??
                unit.parent.convertFrom;
            return this.baseToPureUnitValue(convertFrom(value), unit.parent.unit);
        } else if (unit.dimension.parentUnit) {
            return this.baseToValue(value, unit.dimension.parentUnit);
        } else {
            return value;
        }
    }

    // Util
    /**
     * Checks whether two units are equivalent
     * @param unit The unit to compare to
     * @param weak Whether to check if no conversion is needed, or to check if units are really expressed in the same way (no equivalent units used, or factors rearranged), defaults to false
     * @returns Whether the units are equivalent
     */
    public equals(unit: IUnit, weak: boolean = false): boolean {
        let thisUnit: IUnitFormat = this;
        let otherUnit: IUnitFormat = unit;
        if (weak) {
            thisUnit = this.toBaseDimensions(thisUnit).unit;
            otherUnit = this.toBaseDimensions(otherUnit).unit;
            thisUnit = {
                numerator: this.sortUnits(thisUnit.numerator),
                denominator: this.sortUnits(thisUnit.denominator),
            };
            otherUnit = {
                numerator: this.sortUnits(otherUnit.numerator),
                denominator: this.sortUnits(otherUnit.denominator),
            };
        }

        if (thisUnit.numerator.length != otherUnit.numerator.length) return false;
        if (thisUnit.denominator.length != otherUnit.denominator.length) return false;
        for (let i = 0; i < thisUnit.numerator.length; i++)
            if (getUnit(thisUnit.numerator[i]) != getUnit(otherUnit.numerator[i]))
                return false;
        for (let i = 0; i < thisUnit.denominator.length; i++)
            if (getUnit(thisUnit.denominator[i]) != getUnit(otherUnit.denominator[i]))
                return false;
        return true;
    }

    /** @override */
    public toString(): string {
        const getUnitString = (units: (ILabeledPureUnit | IPureUnit)[]) =>
            units
                .reduce<{unit: ILabeledPureUnit | IPureUnit; amount: number}[]>(
                    (items, unit) =>
                        items.find(item => getUnit(item.unit) == getUnit(unit))
                            ? items.map(item =>
                                  getUnit(item.unit) == getUnit(unit)
                                      ? {...item, amount: item.amount + 1}
                                      : item
                              )
                            : [...items, {unit, amount: 1}],
                    []
                )
                .map(
                    ({amount, unit}) =>
                        getUnitText(unit) + (amount > 1 ? `^${amount}` : "")
                )
                .join("*");

        if (this.numerator.length == 0 && this.denominator.length == 0) return "";
        const denominator = getUnitString(this.denominator);
        const numerator = getUnitString(this.numerator);
        return (
            (this.numerator.length > 0
                ? "" + (this.numerator.length > 1 ? `(${numerator})` : numerator)
                : "1") +
            (this.denominator.length > 0
                ? "/" + (this.denominator.length > 1 ? `(${denominator})` : denominator)
                : "")
        );
    }
}

/**
 * Compares dimension a and b
 * @param a The first dimension
 * @param b The second dimension
 * @returns Whether a should be ahead of b
 */
function compareDimensions(a: IDimension, b: IDimension) {
    return a.priority == b.priority ? a.name < b.name : a.priority < b.priority;
}

/**
 * Retrieves the pure unit from either a pure unit or labeled unit
 * @param unit The unit or labeled unit
 * @returns The retrieved pure unit
 */
export function getUnit(unit: IPureUnit | ILabeledPureUnit): IPureUnit {
    return "unit" in unit ? unit.unit : unit;
}

/**
 * Retrieves the name/alias from a pure unit or labeled unit
 * @param unit The unit or labeled unit
 * @param short Whether to choose the shortest identifier
 * @returns The label of the unit
 */
export function getUnitText(
    unit: IPureUnit | ILabeledPureUnit,
    short: boolean = false
): string {
    return "label" in unit
        ? unit.label
        : short
        ? unit.identifier.name
        : unit.identifier.alias.reduce(
              (shortest, alias) => (shortest.length > alias.length ? alias : shortest),
              unit.identifier.name
          );
}
