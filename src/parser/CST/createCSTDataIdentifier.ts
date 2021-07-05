import {ICSTDataIdentifier} from "../_types/ICSTDataIdentifier";

/**
 * Creates a CST data identifier that the CST parser can use to store data under
 * @param init The initial data of the CST
 */
export function createCSTDataIdentifier<T extends object>(
    init: () => T
): ICSTDataIdentifier<T> {
    return {
        id: Symbol(),
        init,
    };
}
