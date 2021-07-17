import {IFeatureParser} from "./IFeatureParser";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IExecutionFuncs} from "./IExecutionFunc";
import {IFeatureCore} from "./IFeatureCore";

export type IFeature<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The parsing data for the feature */
    parse: IFeatureParser<T>;
} & IFeatureCore<T> &
    IExecutionFuncs<T>;
