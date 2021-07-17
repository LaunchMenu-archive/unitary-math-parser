import {IParserConfig} from "../IParserConfig";
import {TGetAllFeatures} from "../TGetAllFeatures";
import {TGetParserConfigSyntax} from "../TGetParserConfigSyntax";
import {IASTBase} from "./IASTBase";
import {IRecursive, IRP} from "./IRecursive";
import {TGetASTBaseBody} from "./TGetASTBaseBody";
import {TGetSyntaxASTType} from "./TGetSyntaxASTType";
import {TMakeASTRecursive} from "./TMakeASTRecursive";

/**
 * Extracts all AST nodes that are reachable from the main output AST of the parser
 * @param C The config to check
 * @param B Whether to only consider nodes that indicate to be recursive (reachable through reduction)
 */
export type TGetConfigReachableAST<C extends IParserConfig, B = true> =
    | (TGetSyntaxASTType<TGetAllFeatures<TGetParserConfigSyntax<C>>> extends infer R
          ? R extends TGetASTChildren<TGetSyntaxASTType<TGetParserConfigSyntax<C>>, B>
              ? R extends IASTBase
                  ? TMakeASTRecursive<R>
                  : never
              : never
          : never)
    | TMakeASTRecursive<TGetSyntaxASTType<TGetParserConfigSyntax<C>>>;

// Retrieve all recursive children
type TGetASTChildren<T extends IASTBase, B> = TGetASTBaseBody<T> extends infer U
    ? {} extends U
        ? unknown
        : TRecursiveValues<U, B>
    : never;

type TRecursiveValues<T, B> = B extends true
    ? T extends IRecursive<infer U>
        ? U
        : TRecursiveValuesSubtypes<T, B>
    : T extends IASTBase
    ? T
    : TRecursiveValuesSubtypes<T, B>;

type TRecursiveValuesSubtypes<T, B> = T extends IRP<infer P>
    ? P extends IASTBase
        ? never
        : P extends Array<any>
        ? TRecursiveValuesArray<P, B>
        : P extends object
        ? TRecursiveValuesObject<P, B>
        : never
    : never;

type TRecursiveValuesArray<T extends Array<any>, B> = T extends []
    ? T
    : T extends Array<infer U>
    ? TRecursiveValues<U, B>
    : T;

type TRecursiveValuesObject<O extends object, B> = TRecursiveValues<O[keyof O], B>;
