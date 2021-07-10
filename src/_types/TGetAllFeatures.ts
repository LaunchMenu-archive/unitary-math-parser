import {IFeatureSupport} from "./IFeatureSupport";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {IParserConfig} from "./IParserConfig";

// export type TGetAllFeaturesFromConfig<C extends IParserConfig<any>> =

export type TGetAllFeatures<T extends IFeatureSyntax> = T extends infer S
    ?
          | S
          | (S extends {supports: Array<IFeatureSupport<infer K>>}
                ? K extends IFeatureSyntax
                    ? TGetAllFeatures<K>
                    : never
                : never)
    : never;
