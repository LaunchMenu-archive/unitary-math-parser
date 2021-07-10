import {IASTBase} from "./AST/IASTBase";
import {ICSTLeaf} from "./CST/ICSTLeaf";
import {IFeatureSupport} from "./IFeatureSupport";

/**
 * Specifies the syntax structure of a feature
 */
export type IFeatureSyntax<
    C extends (ICSTLeaf | IASTBase)[] | undefined = (ICSTLeaf | IASTBase)[] | undefined,
    A extends object = object,
    N extends string = string,
    S extends IFeatureSupport[] = any
> = {
    /** THe recursive CST structure, with CST nodes replaced by AST nodes */
    CST: C;
    AST: A;
    name: N;
    supports?: S;
};
