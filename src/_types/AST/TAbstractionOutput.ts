import {IFeatureSyntax} from "../IFeatureSyntax";
import {IASTBase} from "./IASTBase";
import {TGetPlainAST} from "./TGetPlainAST";

/** Retrieves the data that the abstraction function should output */
export type TAbstractionOutput<T extends IFeatureSyntax = IFeatureSyntax> = Omit<
    TGetPlainAST<IASTBase<T["name"], T["AST"]>>,
    "type" | "source"
>;
