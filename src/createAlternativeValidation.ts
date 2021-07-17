import {IAlternativeCSTValidation} from "./_types/CST/IAlternativeCSTValidation";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";

/**
 * Creates a new custom validation for alternative nodes
 * @param validation The validation data
 * @returns The validation object
 */
export function createAlternativeValidation<T extends IFeatureSyntax>(
    validation: IAlternativeCSTValidation<T>
): IAlternativeCSTValidation<T> {
    return validation;
}
