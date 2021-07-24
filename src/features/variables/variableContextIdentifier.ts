import {createEvaluationContextIdentifier} from "../../parser/AST/createEvaluationContextIdentifier";
import {IValue} from "../../parser/dataTypes/_types/IValue";
import {INumber} from "../util/number/_types/INumber";
import {defaultVariables} from "./defaultVariables";
import {IVariableGetter} from "./_types/IVariableGetter";

/** A context to store all variables */
export const variableContextIdentifier = createEvaluationContextIdentifier(
    "variables",
    () => new VariableContext(defaultVariables)
);

export class VariableContext {
    protected variables: Record<string, IValue> = {};
    protected variableGetters: IVariableGetter[] = [];

    /**
     * Creates a new variable context
     * @param variables The initial variables
     * @param variableGetters Additional getters
     */
    public constructor(
        variables: Record<string, IValue> = {},
        variableGetters: IVariableGetter[] = []
    ) {
        this.variables = variables;
        this.variableGetters = variableGetters;
    }

    /**
     * Retrieves the variable with the given name or alias
     * @param name The name or alias to look for
     * @param caseInsensitive Whether to ignore casing differences in the variable
     * @returns The variable if any could be found
     */
    public get(name: string, caseInsensitive: boolean = false): IValue | undefined {
        return (
            this.variables[name] ??
            (caseInsensitive
                ? this.variables[name.toLowerCase()] ?? this.variables[name.toUpperCase()]
                : undefined) ??
            this.variableGetters.find(getter => getter(name))
        );
    }

    /**
     * Retrieves all variables in the context
     * @returns All variables and getter functions
     */
    public getAll(): {
        variables: Readonly<Record<string, IValue>>;
        getters: IVariableGetter[];
    } {
        return {variables: this.variables, getters: this.variableGetters};
    }

    /**
     * Retrieves a new variable context that represents this context with the new variables added
     * @param variables The variables to be added
     * @param
     * @returns The newly created context
     */
    public augment(
        variables: Record<string, IValue> | IVariableGetter,
        ...rest: IVariableGetter[]
    ): VariableContext {
        return variables instanceof Function
            ? new VariableContext({...this.variables}, [
                  ...this.variableGetters,
                  variables,
                  ...rest,
              ])
            : new VariableContext({...this.variables, ...variables}, [
                  ...this.variableGetters,
                  ...rest,
              ]);
    }
}
