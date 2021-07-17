import {IEvaluationContextIdentifier} from "../../_types/evaluation/IEvaluationContextIdentifier";

/**
 * A context to store data in during evaluation
 */
export class EvaluationContext {
    protected data: Record<string, any> = {};

    /**
     * Augments the evaluation context
     * @param identifier The identifier of the data to replace/add
     * @param data The data to be added/replaced
     * @returns The new evaluation context
     */
    public augment<T>(
        identifier: IEvaluationContextIdentifier<T>,
        data: T
    ): EvaluationContext {
        const context = new EvaluationContext();
        context.data = {...this.data, [identifier.id]: data};
        return context;
    }

    /**
     * Retrieves the data for the given identifier that's stored in this context
     * @param identifier The identifier to get the data of
     * @returns The data that was found
     */
    public get<T>(identifier: IEvaluationContextIdentifier<T>): T {
        if (!(identifier.id in this.data)) this.data[identifier.id] = identifier.init();
        return this.data[identifier.id];
    }
}
