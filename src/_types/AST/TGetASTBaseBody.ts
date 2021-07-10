import {IASTBase} from "./IASTBase";

/**
 * Retrieves the body params from a AST base node
 */
export type TGetASTBaseBody<T extends IASTBase> = T extends infer U
    ? Omit<U, keyof IASTBase>
    : never;
