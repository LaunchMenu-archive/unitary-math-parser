import {createDimension} from "../createDimension";
import {createBiggerMetricUnits, createSmallerMetricUnits} from "../createMetricUnits";
import {Unit} from "../Unit";
import {meter} from "./lengths";
import {second} from "./times";
import {kilogram} from "./weight";

export const [power, joule] = createDimension({
    name: "power",
    priority: 4,
    unit: {
        name: "joule",
        alias: ["j"],
        equivalent: new Unit([kilogram, meter, meter], [second, second]),
    },
});

const biggerPowers = createBiggerMetricUnits(joule);
export const [
    decajoule,
    hectojoule,
    kilojoule,
    megajoule,
    gigajoule,
    terajoule,
    petajoule,
    exajoule,
    zettajoule,
    yottajoule,
] = biggerPowers;

const smallerPowers = createSmallerMetricUnits(joule);
export const [
    decijoule,
    centijoule,
    millijoule,
    microjoule,
    nanojoule,
    picojoule,
    femtojoule,
    attojoule,
    zeptojoule,
    yoctojoule,
] = smallerPowers;

export const powers = [joule, ...biggerPowers, ...smallerPowers];
