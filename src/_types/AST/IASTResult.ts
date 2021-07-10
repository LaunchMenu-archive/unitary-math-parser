import {IParserConfig} from "../IParserConfig";
import {IASTBase} from "./IASTBase";
import {TGetConfigOutputAST} from "./TGetConfigOutputAST";
import {TGetConfigReachableAST} from "./TGetConfigReachableFeatureSyntax";
import {TGetReductionASTNode} from "./TGetReductionASTNode";

export type IASTResult<C extends IParserConfig> = {
    /** The tree that was obtained */
    tree: TGetConfigOutputAST<C>;
    /**
     * Walks a tree and reduces it to some result
     * @param step The step case for the tree walk
     * @returns The result of the reduction
     */
    reduce<O>(step: (node: TGetReductionASTNode<TGetConfigReachableAST<C>, O>) => O): O;
};
