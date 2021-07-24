import {createDataTypeAugmentation} from "../../../parser/dataTypes/createDataTypeAugmentation";
import {number} from "./number";
import {Unit} from "./Unit";

/** A unit augmentation for number values */
export const unitAugmentation = createDataTypeAugmentation({
    name: "unit",
    dataType: [number],
    init: () => ({unit: new Unit([], []), isPureUnit: false}),
    merge: values => ({
        augmentation: {
            unit: values[0]?.augmentation.unit ?? new Unit([], []),
            isPureUnit: values.every(({augmentation}) => augmentation.isPureUnit),
        },
    }),
});
