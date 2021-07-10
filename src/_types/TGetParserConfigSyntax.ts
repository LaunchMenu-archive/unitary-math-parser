import {IParserConfig} from "./IParserConfig";

/**
 * Extracts the syntax type from a config
 */
export type TGetParserConfigSyntax<C extends IParserConfig> = C extends IParserConfig<
    infer A
>
    ? A
    : never;
