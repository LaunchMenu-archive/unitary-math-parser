import {createBaseNumberFormats} from "../util/formats/createBaseNumberFormats";
import {number} from "../util/number/number";
import {Unit} from "../util/number/Unit";
import {unitAugmentation} from "../util/number/unitAugmentation";
import {joule} from "../util/number/units/power";
import {second} from "../util/number/units/times";

/** Default scientific constants */
export const defaultConstants = {
    pi: number.create(Math.PI),
    e: number.create(Math.E),
    n_a: number.create(6.02214076e23),
    H: number.create(6.62607015e-34).augment(unitAugmentation, {
        unit: new Unit([joule, second], []),
        isPureUnit: false,
    }),
};

/** The default variables that should be available */
export const defaultVariables = {
    ...defaultConstants,
    ...createBaseNumberFormats(),
};
