import {IUnitaryNumber} from "../../_types/evaluation/number/IUnitaryNumber";
import {createNumber} from "../util/number/createNumber";
import {isNumber} from "../util/number/isNumber";
import {createFunctionExecution} from "./createFunctionExecution";

export const absFunction = createFunctionExecution({
    name: "abs",
    check: [isNumber],
    exec: ({value, unit}: IUnitaryNumber) => createNumber(Math.abs(value), unit),
});

export const defaultFunctions = [absFunction];
