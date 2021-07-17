import {IPureUnit} from "./IPureUnit";

/** The unit including the label that was used to obtain it */
export type ILabeledPureUnit = {
    /** The unit */
    unit: IPureUnit;
    /** The name that was used for the unit (either the unit's name or one of its aliases) */
    label: string;
};
