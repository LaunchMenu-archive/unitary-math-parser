import {ICST} from "./CST/ICST";
import {IASTBase} from "./AST/IASTBase";
import {TMakeASTRecursive} from "./AST/TMakeASTRecursive";
import {IFeatureSyntax} from "./IFeatureSyntax";
import {TGetSyntaxASTType} from "./AST/TGetSyntaxASTType";

export type IParser<T extends IFeatureSyntax> = {
    /**
     * Retrieves the parsing options for a given text input
     * @param input The input to be parsed
     * @returns The getters for data that can be obtained from the text input
     */
    (input: string): {
        /**
         * Parses the input to obtain a concrete syntax tree
         * @returns The concrete syntax tree of the input
         */
        parseRaw(): ICST;
        /**
         * Parses the input to obtain an abstract syntax tree
         * @returns The abstract syntax tree of the input
         */
        parse(): TMakeASTRecursive<TGetSyntaxASTType<T>>;
        // highlight():
        // evaluate():
    };
};
