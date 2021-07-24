import {createToken as createChevrotainToken, ITokenConfig, TokenType} from "chevrotain";

/**
 * Creates a new token
 * @param config The configuration for the token
 * @returns The created token
 */
export function createToken(
    config: ITokenConfig & {before?: TokenType[]}
): TokenType & {before?: TokenType[]} {
    return {...createChevrotainToken(config), before: config.before};
}
