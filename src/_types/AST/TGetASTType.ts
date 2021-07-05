import {IFeatureSupport} from "../IFeatureSupport";
import {IFeature} from "../IFeature";
import {IBaseFeature} from "../IBaseFeature";
import {TGetSyntaxASTType} from "./TGetSyntaxASTType";

/** Extras the AST type from a given feature or feature support */
export type TGetASTType<T extends IFeature | IBaseFeature | IFeatureSupport> =
    T extends IFeature<infer A>
        ? TGetSyntaxASTType<A>
        : T extends IFeatureSupport<infer A>
        ? TGetSyntaxASTType<A>
        : T extends IBaseFeature<infer A>
        ? TGetSyntaxASTType<A>
        : never;
