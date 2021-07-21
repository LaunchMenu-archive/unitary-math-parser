import {createEvaluationContextIdentifier} from "../../parser/AST/createEvaluationContextIdentifier";
import {INumber} from "../util/number/_types/INumber";
import {defaultVariables} from "./defaultVariables";

/** A context to store all variables */
export const variableContextIdentifier = createEvaluationContextIdentifier(
    "variables",
    () => new VariableContext(defaultVariables)
);

export class VariableContext {
    protected variables: Record<string, INumber> = {};

    /**
     * Creates a new variable context
     * @param variables The initial variables
     */
    public constructor(variables: Record<string, INumber> = {}) {
        this.variables = variables;
    }

    /**
     * Retrieves the variable with the given name or alias
     * @param name The name or alias to look for
     * @returns The variable if any could be found
     */
    public get(name: string): INumber | undefined {
        return this.variables[name];
    }

    /**
     * Retrieves all variables in the context
     * @returns All variables
     */
    public getAll(): Readonly<Record<string, INumber>> {
        return this.variables;
    }

    /**
     * Retrieves a new variable context that represents this context with the new variables added
     * @param variables The variables to be added
     * @returns The newly created context
     */
    public augment(variables: Record<string, INumber>): VariableContext {
        return new VariableContext({...this.variables, ...variables});
    }
}
