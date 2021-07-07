import {IToken} from "chevrotain";
import {TGetSyntaxASTType} from "./AST/TGetSyntaxASTType";
import {TMakeASTRecursive} from "./AST/TMakeASTRecursive";
import {ICST} from "./CST/ICST";
import {IUnknownCharacterError} from "./errors/IUnknownCharacterError";
import {IFeatureSyntax} from "./IFeatureSyntax";

/** The result after parsing */
export type IParsingResult<T extends IFeatureSyntax> = {
    /** The errors that were found while tokenizing */
    readonly tokenErrors: IUnknownCharacterError[];
    /** The tokens of the input */
    readonly tokens: IToken[];
    /** The concrete syntax tree obtained from the result */
    readonly cst: ICST;
    /** The abstract syntax tree of the input */
    get ast(): TMakeASTRecursive<TGetSyntaxASTType<T>>;
};
