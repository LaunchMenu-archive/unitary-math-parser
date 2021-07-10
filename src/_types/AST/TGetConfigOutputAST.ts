import {TGetSyntaxASTType} from "./TGetSyntaxASTType";
import {TMakeASTRecursive} from "./TMakeASTRecursive";
import {IParserConfig} from "../IParserConfig";
import {TGetParserConfigSyntax} from "../TGetParserConfigSyntax";
import {TGetPlainAST} from "./TGetPlainAST";

/**
 * Retrieves the output AST type from a config
 */
export type TGetConfigOutputAST<C extends IParserConfig> = TMakeASTRecursive<
    TGetPlainAST<TGetSyntaxASTType<TGetParserConfigSyntax<C>>>
>;
