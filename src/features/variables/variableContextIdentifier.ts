import {createEvaluationContextIdentifier} from "../../parser/AST/createEvaluationContextIdentifier";
import {IUnitaryNumber} from "../../_types/evaluation/number/IUnitaryNumber";
import {defaultVariables} from "./defaultVariables";

/** A context to store all variables */
export const variableContextIdentifier = createEvaluationContextIdentifier(
    "variables",
    () => new VariableContext(defaultVariables)
);

export class VariableContext {
    protected variables: Record<string, IUnitaryNumber> = {};

    /**
     * Creates a new variable context
     * @param variables The initial variables
     */
    public constructor(variables: Record<string, IUnitaryNumber> = {}) {
        this.variables = variables;
    }

    /**
     * Retrieves the variable with the given name or alias
     * @param name The name or alias to look for
     * @returns The variable if any could be found
     */
    public get(name: string): IUnitaryNumber | undefined {
        return this.variables[name];
    }

    /**
     * Retrieves all variables in the context
     * @returns All variables
     */
    public getAll(): Readonly<Record<string, IUnitaryNumber>> {
        return this.variables;
    }

    /**
     * Retrieves a new variable context that represents this context with the new variables added
     * @param variables The variables to be added
     * @returns The newly created context
     */
    public augment(variables: Record<string, IUnitaryNumber>): VariableContext {
        return new VariableContext({...this.variables, ...variables});
    }
}
