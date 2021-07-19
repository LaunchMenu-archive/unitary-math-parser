import {createEvaluationContextIdentifier} from "../../parser/AST/createEvaluationContextIdentifier";
import {createEvaluationError} from "../../parser/AST/createEvaluationError";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {ICST} from "../../_types/CST/ICST";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {getOptionString} from "../util/getOptionString";
import {defaultFunctions} from "./defaultFunctions";
import {IFunctionExecution} from "./_types/IFunctionExecution";

/** A context to store all functions */
export const functionContextIdentifier = createEvaluationContextIdentifier(
    "functions",
    () => new FunctionContext(defaultFunctions)
);

export class FunctionContext {
    protected functions: Record<string, IFunctionExecution[]> = {};

    /**
     * Creates a new function context
     * @param functions The initial functions
     */
    public constructor(functions: IFunctionExecution[] = []) {
        functions.forEach(func => {
            if (!this.functions[func.name]) this.functions[func.name] = [];
            this.functions[func.name].push(func);
        });
    }

    /**
     * Retrieves the functions with the given name
     * @param name The name to look for
     * @returns The variable if any could be found
     */
    public get(name: string): IFunctionExecution[] {
        return this.functions[name];
    }

    /**
     * Retrieves all the functions in the context
     * @returns All the functions in the context
     */
    public getAll(): IFunctionExecution[] {
        return Object.values(this.functions).flatMap(funcs => funcs);
    }

    /**
     * Retrieves a new function context that represents this context with the new functions added
     * @param functions The functions to be added
     * @returns The newly created context
     */
    public augment(functions: IFunctionExecution[]): FunctionContext {
        const funcs = new FunctionContext();
        funcs.functions = this.functions;
        functions.forEach(func => {
            if (funcs.functions[func.name]) funcs.functions[func.name] = [];
            funcs.functions[func.name].push(func);
        });
        return funcs;
    }

    /**
     * Executes the function with the specified name
     * @param name The name of the function
     * @param args The arguments to passed
     * @param source The sources for the func and args
     * @param context The evaluation context to use
     * @returns The function result or an error
     */
    public exec(
        name: string,
        args: any[],
        source: {name: ICST; allArgs: ICST; args: ICST[]},
        context: EvaluationContext
    ): any {
        // Find the function definitions
        const funcs = this.functions[name];
        if (!funcs)
            return createEvaluationError(
                {
                    type: "unknownFunction",
                    message: i => `Unknown function found at index ${i}: "${name}"`,
                    multilineMessage: pm => `Unknown function "${name}" found:\n${pm}`,
                    source: source.name,
                    extra: {name},
                },
                context
            );

        // Retrieve all functions with the correct arguments
        const validatedExecs = funcs.map(({check, exec}) => ({
            count: check.length,
            checks: args.slice(0, check.length).map((arg, i) => {
                const c = check[i];
                if (c instanceof Function)
                    return {hasCorrectType: c(arg), type: c.typeName, error: undefined};
                else if (c.type(arg))
                    return {
                        hasCorrectType: true,
                        type: c.type.typeName,
                        error: c.value?.(arg),
                    };
                return {hasCorrectType: false, type: c.type.typeName, error: undefined};
            }),
            exec,
        }));
        const correctArgExecs = validatedExecs.filter(({checks}) =>
            checks.every(({hasCorrectType: correctType, error}) => correctType && !error)
        );
        if (correctArgExecs.length == 0) {
            for (let i = args.length - 1; i >= 0; i--) {
                const iCorrectArgExecs = validatedExecs.filter(({checks}) => {
                    for (let j = 0; j < i; j++) {
                        if (!checks[0].hasCorrectType) return false;
                        if (checks[0].error) return false;
                    }
                    return true;
                });
                if (iCorrectArgExecs.length > 0) {
                    const optionString = getOptionString(
                        iCorrectArgExecs.map(({checks}) => {
                            const check = checks[i];
                            if (!check.hasCorrectType) return check.type;
                            if (check.error) return check.error;
                            return "";
                        })
                    );
                    const errorMessage = `Received: ${args[i]}, but expected ${
                        optionString[0].match(/[auioe]/) ? "an" : "a"
                    } ${optionString}`;

                    return createEvaluationError(
                        {
                            type: "incorrectFunctionArgType",
                            message: i =>
                                `Found expression of wrong data type at index ${i}. ${errorMessage}`,
                            multilineMessage: pm =>
                                `Found expression of wrong data type:\n${pm}\n${errorMessage}`,
                            source: source.args[i],
                            extra: {index: i, options: iCorrectArgExecs},
                        },
                        context
                    );
                }
            }
        }

        // Get all evaluations with the correct argument count
        const acceptedExecs = correctArgExecs.filter(({count}) => count == args.length);
        if (acceptedExecs.length == 0) {
            const counts = correctArgExecs.reduce(
                (counts, {count}) =>
                    counts.includes(count) ? counts : [count, ...counts],
                [] as number[]
            );
            const countArgumentsString = `${getOptionString(
                counts.map(count => count + "")
            )} argument${counts.length == 1 && counts[0] == 1 ? "" : "s"}`;
            return createEvaluationError(
                {
                    type: "incorrectFunctionArgCount",
                    message: i =>
                        `Incorrect argument count found at index ${i}, expected ${countArgumentsString} but received ${args.length}`,
                    multilineMessage: pm =>
                        `Incorrect argument count found, expected ${countArgumentsString} but received ${args.length}:\n${pm}`,
                    source: source.allArgs,
                },
                context
            );
        }

        // Apply the valid function
        return acceptedExecs[0].exec(...args);
    }
}
