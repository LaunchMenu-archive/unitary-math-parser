import {IDimension} from "./IDimension";

/** The combined dimensions that a full unit may have */
export type IUnitDimensions = {
    /** The numerator part of the dimension */
    numerator: IDimension[];
    /** The denominator part of the dimension */
    denominator: IDimension[];
};
