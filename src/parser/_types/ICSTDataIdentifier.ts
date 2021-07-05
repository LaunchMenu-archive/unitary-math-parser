export type ICSTDataIdentifier<T> = {
    /** The identifier */
    id: Symbol;
    /** The initial state */
    init: () => T;
};
