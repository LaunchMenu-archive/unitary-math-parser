import {IFeatureSyntax} from "../IFeatureSyntax";
import {IASTBase} from "./IASTBase";

/** Retrieves all separately produces AST types given a union of IFeatureSyntaxes */
export type TGetSyntaxASTType<T extends IFeatureSyntax> = T extends infer A
    ? A extends IFeatureSyntax
        ? IASTBase<T["name"], T["AST"]>
        : never
    : never;
