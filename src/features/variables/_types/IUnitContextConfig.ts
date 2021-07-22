import {ISimplifyConfig} from "../../../_types/evaluation/number/ISimplifyConfig";

/** User configuration regarding unit handling */
export type IUnitContextConfig = {
    /** Whether to turn unknown units into custom units, defaults to true */
    customUnits?: boolean;
    /** Configuration related to simplifying units after multiplication or division */
    simplification?: ISimplifyConfig;
    /** Sort units when multiplying or dividing, E.g. (5kg * 2s) = 10kg*s and (2s * 5kg) = 10kg*s */
    sortUnits?: boolean;
    /** Whether to remove factors that have no dimensionless units. E.g. (10 * 50%) = 5 instead of (10 * 50%) = 500%, defaults to true */
    removeDimensionlessFactors?: boolean;
};
