import {IFeatureSyntax} from "../IFeatureSyntax";
import {IASTBase} from "./IASTBase";
import {IASTRecursive} from "./IASTRecursive";
import {TIsRecursiveNode} from "./TMakeASTRecursive";

/** Retrieves all separately produces AST types given a union of IFeatureSyntaxes */
export type TGetSyntaxASTType<T extends IFeatureSyntax> = T extends infer A
    ? A extends IFeatureSyntax
        ? TIsRecursiveNode<T["AST"], IASTRecursive, IASTBase<T["name"], T["AST"]>>
        : never
    : never;
