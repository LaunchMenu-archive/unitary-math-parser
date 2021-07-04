import {IASTBase} from "./AST/IASTBase";
import {IBaseFeature} from "./IBaseFeature";
import {IFeature} from "./IFeature";
import {IFeatureSyntax} from "./IFeatureSyntax";

export type IParserConfig<T extends IFeatureSyntax = IFeatureSyntax> = {
    features: IFeature<T>[];
    baseFeatures: IBaseFeature<T>[];
};
