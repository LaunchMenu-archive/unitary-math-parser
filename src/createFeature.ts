import {IFeature} from "./_types/IFeature";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IExecutionFuncs, IOptionalExecutionFuncs} from "./_types/IExecutionFunc";

/**
 * Creates a new feature
 * @param feature The feature description
 * @returns The created feature
 */
export function createFeature<T extends IFeatureSyntax>(
    feature: Omit<IFeature<T>, keyof IExecutionFuncs<any>> & IOptionalExecutionFuncs<T>
): IFeature<T> {
    return feature as any;
}
