import {createDataTypeAugmentation} from "../../../parser/dataTypes/createDataTypeAugmentation";
import {number} from "../number/number";
import {IValueFormat} from "./_types/IValueFormat";

/** An augmentation of storying the output format with a value */
export const formatAugmentation = createDataTypeAugmentation({
    name: "format",
    dataType: [number],
    init: (): undefined | IValueFormat => undefined,
    merge: formats => {
        let best = {count: 0, format: undefined as undefined | IValueFormat};
        const all: Record<any, number> = {};
        formats.forEach(({augmentation: f}) => {
            if (!f) return;

            const prev = all[f.identifier as any];
            const value = (all[f.identifier as any] = prev ? prev + 1 : 1);
            if (value > best.count) best = {count: value, format: f};
        });

        return {augmentation: best.format};
    },
});
