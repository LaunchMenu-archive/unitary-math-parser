import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {v4 as uuid} from "uuid";
import {IFeatureSupport} from "./_types/IFeatureSupport";

/**
 * Creates a new feature support rule
 * @param feature The feature support description
 * @returns The created feature support
 */
export function createFeatureSupport<T extends IFeatureSyntax>(
    feature: Omit<IFeatureSupport<T>, "id">
): IFeatureSupport<T> {
    return {
        id: uuid(),
        ...feature,
    };
}
