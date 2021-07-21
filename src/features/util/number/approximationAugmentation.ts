import {createDataTypeAugmentation} from "../../../parser/dataTypes/createDataTypeAugmentation";

/** An approximation augmentation for number values */
export const approximationAugmentation = createDataTypeAugmentation({
    name: "approximation",
    init: (value: number) => false,
    merge: values => ({
        augmentation: values.some(value => value),
    }),
});
