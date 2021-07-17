export type ISimplifyConfig = {
    /** Whether to expand units if it helps for canceling out units, defaults to false */
    expandUnitsToCancelOut?: boolean;
    /** Whether to expand units (no matter what), defaults to false */
    expandUnits?: boolean;
    /** Change units of the same dimensions to all be the same units, defaults to true */
    convertUnits?: boolean;
};
