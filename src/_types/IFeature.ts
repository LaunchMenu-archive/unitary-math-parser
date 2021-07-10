import {IFeatureParser} from "./IFeatureParser";
import {ICST} from "./CST/ICST";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {TGetConversionTree} from "./CST/TGetConversionTree";
import {TAbstractionOutput} from "./AST/TAbstractionOutput";
import {IRecurseFunc} from "./IRecurseFunc";

export type IFeature<T extends IFeatureSyntax = IFeatureSyntax> = {
    /** The name of the feature */
    name: T["name"];
    /** The parsing data for the feature */
    parse: IFeatureParser<T["supports"] extends any[] ? T["supports"] : []>;
    /**
     * Transforms the concrete syntax tree to an abstract syntax tree node
     * @param tree The concrete syntax tree node to transform
     * @param source The concrete syntax tree source node
     * @returns The abstract syntax tree node
     */
    abstract(tree: TGetConversionTree<T["CST"]>, source: ICST): TAbstractionOutput<T>;
} & IRecurseFunc<T>;
