import {createDataTypeAugmentation} from "../../../parser/dataTypes/createDataTypeAugmentation";
import {Unit} from "./Unit";

/** A unit augmentation for number values */
export const unitAugmentation = createDataTypeAugmentation({
    name: "unit",
    init: (value: number) => ({unit: new Unit([], []), isPureUnit: false}),
    merge: values => ({
        augmentation: {
            unit: values[0]?.augmentation.unit ?? new Unit([], []),
            isPureUnit: values.every(({augmentation}) => augmentation.isPureUnit),
        },
    }),
});
