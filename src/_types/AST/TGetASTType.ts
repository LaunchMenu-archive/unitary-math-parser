import {IFeatureSupport} from "../IFeatureSupport";
import {IFeature} from "../IFeature";
import {IASTBase} from "./IASTBase";
import {IBaseFeature} from "../IBaseFeature";

/** Extras the AST type from a given feature or feature support */
export type TGetASTType<T extends IFeature | IBaseFeature | IFeatureSupport> =
    T extends IFeature<infer A>
        ? A["AST"] & IASTBase<A["name"]>
        : T extends IFeatureSupport<infer A>
        ? A["AST"] & IASTBase<A["name"]>
        : T extends IBaseFeature<infer A>
        ? A["AST"] & IASTBase<A["name"]>
        : never;
