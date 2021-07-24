import {IValue} from "../../../parser/dataTypes/_types/IValue";

/** A function to retrieve a variable */
export type IVariableGetter = {
    /**
     * Retrieves a variable if possible
     * @param name The variable name to lookup
     * @returns The value if it could be found
     */
    (name: string): undefined | IValue;
};
