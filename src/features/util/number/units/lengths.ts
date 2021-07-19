import {createDimension} from "../createDimension";
import {createBiggerMetricUnits, createSmallerMetricUnits} from "../createMetricUnits";

export const [length, meter] = createDimension({
    name: "length",
    priority: 0,
    unit: {
        name: "meter",
        alias: ["m", "meters"],
    },
});

const biggerLengths = createBiggerMetricUnits(meter);
export const [
    decameter,
    hectometer,
    kilometer,
    megameter,
    gigameter,
    terameter,
    petameter,
    exameter,
    zettameter,
    yottameter,
] = biggerLengths;

const smallerLengths = createSmallerMetricUnits(meter);
export const [
    decimeter,
    centimeter,
    millimeter,
    micrometer,
    nanometer,
    picometer,
    femtometer,
    attometer,
    zeptometer,
    yoctometer,
] = smallerLengths;

export const lengths = [meter, ...smallerLengths, ...biggerLengths];
