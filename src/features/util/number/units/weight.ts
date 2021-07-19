import {createDimension} from "../createDimension";
import {createBiggerMetricUnits, createSmallerMetricUnits} from "../createMetricUnits";

export const [weight, gram] = createDimension({
    name: "weight",
    priority: 0,
    unit: {
        name: "gram",
        alias: ["g", "grams"],
    },
});

const biggerWeights = createBiggerMetricUnits(gram);
export const [
    decagram,
    hectogram,
    kilogram,
    megagram,
    gigagram,
    teragram,
    petagram,
    exagram,
    zettagram,
    yottagram,
] = biggerWeights;

const smallerWeights = createSmallerMetricUnits(gram);
export const [
    decigram,
    centigram,
    milligram,
    microgram,
    nanogram,
    picogram,
    femtogram,
    attogram,
    zeptogram,
    yoctogram,
] = smallerWeights;

export const weights = [gram, ...biggerWeights, ...smallerWeights];
