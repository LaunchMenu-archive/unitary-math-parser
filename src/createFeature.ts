import {IFeature} from "./_types/IFeature";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IOptionalRecurseFunc} from "./_types/IRecurseFunc";

/**
 * Creates a new feature
 * @param feature The feature description
 * @returns The created feature
 */
export function createFeature<T extends IFeatureSyntax>(
    feature: Omit<IFeature<T>, "recurse"> & IOptionalRecurseFunc<T>
): IFeature<T> {
    return feature as any;
}
