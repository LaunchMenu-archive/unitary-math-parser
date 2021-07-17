import {ILabeledPureUnit} from "./ILabeledPureUnit";
import {IPureUnit} from "./IPureUnit";

/** The format of a unit */
export type IUnitFormat = {
    /** The base units at the numerator side */
    readonly numerator: (IPureUnit | ILabeledPureUnit)[];
    /** The base units at the denominator side */
    readonly denominator: (IPureUnit | ILabeledPureUnit)[];
};
