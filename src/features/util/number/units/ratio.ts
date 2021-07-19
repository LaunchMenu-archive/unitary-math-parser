import {IPureUnit} from "../../../../_types/evaluation/number/IPureUnit";
import {createDimension} from "../createDimension";
import {Unit} from "../Unit";

export const [ratio, fraction] = createDimension({
    name: "ratio",
    priority: 0,
    unit: {
        name: "fraction",
        equivalent: new Unit([], []),
    },
});

export const percentage: IPureUnit = {
    identifier: {
        name: "percentage",
        alias: ["%"],
    },
    dimension: ratio,
    parent: {
        unit: fraction,
        convertFrom: v => v * 100,
        convertTo: v => v / 100,
    },
};

export const partsPerMillion: IPureUnit = {
    identifier: {
        name: "partsPerMilion",
        alias: ["parts-per-million", "ppm"],
    },
    dimension: ratio,
    parent: {
        unit: fraction,
        convertFrom: v => v * 1e6,
        convertTo: v => v / 1e6,
    },
};

export const ratios = [fraction, percentage, partsPerMillion];
