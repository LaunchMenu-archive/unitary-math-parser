import {IBaseFeature} from "../IBaseFeature";
import {IFeature} from "../IFeature";
import {IFeatureSupport} from "../IFeatureSupport";
import {IFeatureSyntax} from "../IFeatureSyntax";
import {IValidateCST} from "./IValidateCST";
import {TGetCSTNode} from "./TGetCSTNode";

/** The validation for a feature */
export type IAlternativeCSTValidation<T extends IFeatureSyntax> = {
    /** The feature that the validation is for */
    feature: IFeature<T> | IBaseFeature<T> | IFeatureSupport<T>;
    /** The validation to be used */
    validation: IValidateCST<TGetCSTNode<T["CST"]>>[];
};
