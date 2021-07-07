import {IFeatureSyntax} from "../IFeatureSyntax";
import {IASTBase} from "./IASTBase";
import {IASTExpression} from "./IASTExpression";
import {TIsRecursiveNode} from "./TMakeASTRecursive";

/** Retrieves all separately produces AST types given a union of IFeatureSyntaxes */
export type TGetSyntaxASTType<T extends IFeatureSyntax> = T extends infer A
    ? A extends IFeatureSyntax
        ? TIsRecursiveNode<T["AST"], IASTExpression, IASTBase<T["name"], T["AST"]>>
        : never
    : never;
