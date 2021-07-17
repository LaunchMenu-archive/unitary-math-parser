import {IEvaluationContextIdentifier} from "../../_types/evaluation/IEvaluationContextIdentifier";
import {v4 as uuid} from "uuid";

/**
 * Creates a new evaluation context data identifier
 * @param name The name of the identifier
 * @param init The function to retrieve the initial data
 * @returns The evaluation identifier
 */
export function createEvaluationContextIdentifier<T>(
    name: string,
    init: () => T
): IEvaluationContextIdentifier<T> {
    return {
        name,
        init,
        id: uuid(),
    };
}
