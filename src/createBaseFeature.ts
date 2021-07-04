import {IBaseFeature} from "./_types/IBaseFeature";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";

/**
 * Creates a new feature
 * @param feature The feature description
 * @returns The created feature
 */
export function createBaseFeature<T extends IFeatureSyntax>(
    feature: IBaseFeature<T>
): IBaseFeature<T> {
    return feature;
}
