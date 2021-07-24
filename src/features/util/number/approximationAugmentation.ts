import {createDataTypeAugmentation} from "../../../parser/dataTypes/createDataTypeAugmentation";
import {number} from "./number";

/** An approximation augmentation for number values */
export const approximationAugmentation = createDataTypeAugmentation({
    name: "approximation",
    dataType: [number],
    init: () => false,
    merge: values => ({
        augmentation: values.some(value => value),
    }),
});
