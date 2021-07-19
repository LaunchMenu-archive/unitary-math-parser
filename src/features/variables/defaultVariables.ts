import {createNumber} from "../util/number/createNumber";
import {Unit} from "../util/number/Unit";
import {joule} from "../util/number/units/power";
import {second} from "../util/number/units/times";
import {unitLess} from "../util/number/units/unitLess";

/** The default variables that should be available */
export const defaultVariables = {
    pi: createNumber(Math.PI, unitLess),
    e: createNumber(Math.E, unitLess),
    n_a: createNumber(6.02214076e23, unitLess),
    h: createNumber(6.62607015e-34, new Unit([joule, second], [])),
};
