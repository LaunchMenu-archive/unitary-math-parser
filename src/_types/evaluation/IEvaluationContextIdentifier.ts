/** Data obtainable from the context */
export type IEvaluationContextIdentifier<T> = {
    /** The name of this data */
    name: string;
    /** The id of the context data */
    id: string;
    /**
     * Retrieves the initial data of the context
     * @returns The initial data
     */
    init: () => T;
};
