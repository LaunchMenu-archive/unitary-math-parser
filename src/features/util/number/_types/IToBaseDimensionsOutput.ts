import {ILabeledPureUnit} from "../../../../_types/evaluation/number/ILabeledPureUnit";
import {IPureUnit} from "../../../../_types/evaluation/number/IPureUnit";
import {IUnitFormat} from "../../../../_types/evaluation/number/IUnitFormat";

export type IToBaseDimensionsOutput = {
    /** The unit expressed in only base dimensions */
    unit: IUnitFormat;
    /** The units that were expanded along the way, where furthest to the right are the top level units */
    encounteredDerivedUnits: {
        /** Whether the unit was part of the numerator */
        inDenominator: boolean;
        /** The unit itself */
        unit: IPureUnit | ILabeledPureUnit;
    }[];
};
