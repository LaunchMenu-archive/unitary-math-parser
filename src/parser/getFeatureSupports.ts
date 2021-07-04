import {IFeatureSupport} from "../_types/IFeatureSupport";
import {IParserConfig} from "../_types/IParserConfig";
import {ISupportable} from "./_types/ISupportable";

/**
 * Extracts all feature supports given a parser config
 * @param config The parser config
 * @returns All the used feature supports
 */
export function getFeatureSupports(config: IParserConfig): IFeatureSupport[] {
    const stack: ISupportable[] = [...config.baseFeatures, ...config.features];
    const supports = new Set<IFeatureSupport>();
    while (stack.length > 0) {
        const top = stack.pop()!;
        top.parse.supports?.forEach(support => {
            if (!supports.has(support)) {
                supports.add(support);
                stack.push(support);
            }
        });
    }
    return [...supports];
}
