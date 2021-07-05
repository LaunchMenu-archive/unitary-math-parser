import {IASTBase} from "./AST/IASTBase";
import {ICSTLeaf} from "./CST/ICSTLeaf";

/**
 * Specifies the syntax structure of a feature
 */
export type IFeatureSyntax<
    C extends (ICSTLeaf | IASTBase)[] | undefined = (ICSTLeaf | IASTBase)[] | undefined,
    A extends object = object,
    N extends string = string
> = {
    CST: C;
    AST: A;
    name: N;
};
