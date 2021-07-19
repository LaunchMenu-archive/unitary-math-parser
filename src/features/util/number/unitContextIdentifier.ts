import {createEvaluationContextIdentifier} from "../../../parser/AST/createEvaluationContextIdentifier";
import {IPureUnit} from "../../../_types/evaluation/number/IPureUnit";
import {allUnits} from "./units/all";

/** A context to store all units */
export const unitContextIdentifier = createEvaluationContextIdentifier(
    "units",
    () => new UnitContext(allUnits)
);

export class UnitContext {
    protected units: Record<string, IPureUnit> = {};

    /**
     * Creates a new unit context
     * @param units The initial units
     */
    public constructor(units: IPureUnit[] = []) {
        units.forEach(unit => {
            this.units[unit.identifier.name] = unit;
            unit.identifier.alias.forEach(alias => {
                this.units[alias] = unit;
            });
        });
    }

    /**
     * Retrieves the unit with the given name or alias
     * @param name The name or alias to look for
     * @returns The unit if any could be found
     */
    public get(name: string): IPureUnit | undefined {
        return this.units[name];
    }

    /**
     * Retrieves a new unit context that represents this context with the new units added
     * @param units The units to be added
     * @returns The newly created context
     */
    public augment(...units: IPureUnit[]): UnitContext {
        const newContext = new UnitContext(units);
        newContext.units = {...this.units, ...newContext.units};
        return newContext;
    }
}
