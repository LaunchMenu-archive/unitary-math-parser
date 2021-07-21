import {number} from "../util/number/number";
import {INumber} from "../util/number/_types/INumber";
import {createFunctionExecution} from "./createFunctionExecution";

export const absFunction = createFunctionExecution({
    name: "abs",
    check: [number],
    exec: ([val]: [INumber]) => ({value: Math.abs(val.data), type: number}),
});

export const defaultFunctions = [absFunction];
