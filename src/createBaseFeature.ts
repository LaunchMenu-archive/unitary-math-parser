import {IBaseFeature} from "./_types/IBaseFeature";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IOptionalRecurseFunc} from "./_types/IRecurseFunc";

/**
 * Creates a new feature
 * @param feature The feature description
 * @returns The created feature
 */
export function createBaseFeature<T extends IFeatureSyntax>(
    feature: Omit<IBaseFeature<T>, "recurse"> & IOptionalRecurseFunc<T>
): IBaseFeature<T> {
    return feature as any;
}
