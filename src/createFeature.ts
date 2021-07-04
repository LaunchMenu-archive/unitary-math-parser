import {IFeature} from "./_types/IFeature";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";

/**
 * Creates a new feature
 * @param feature The feature description
 * @returns The created feature
 */
export function createFeature<T extends IFeatureSyntax>(
    feature: IFeature<T>
): IFeature<T> {
    return feature;
}
