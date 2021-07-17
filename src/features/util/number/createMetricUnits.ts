import {IPureUnit} from "../../../_types/evaluation/number/IPureUnit";
import {createFactoredUnits} from "./createFactoredUnits";
import {IFactorUnitConfig} from "./_types/IFactorUnitConfig";

// https://en.wikipedia.org/wiki/Unit_of_length
/**
 * Creates all the smaller prefixes for the given unit
 * @param base The base unit
 * @returns All the prefixed pure units
 */
export function createSmallerMetricUnits(
    base: IPureUnit
): [
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit
] {
    function map({name, alias, factor}: IFactorUnitConfig): IFactorUnitConfig {
        return {
            name: name + base.identifier.name,
            alias: base.identifier.alias.map((a, i) => (alias?.[i] ?? "") + a),
            factor,
        };
    }
    const smaller = [
        {name: "deci", alias: ["d"], factor: 1e-1},
        {name: "centi", alias: ["c"], factor: 1e-1},
        {name: "milli", alias: ["m"], factor: 1e-1},
        {name: "micro", alias: ["μ"], factor: 1e-3},
        {name: "nano", alias: ["n"], factor: 1e-3},
        {name: "pico", alias: ["p"], factor: 1e-3},
        {name: "femto", alias: ["f"], factor: 1e-3},
        {name: "atto", alias: ["a"], factor: 1e-3},
        {name: "zepto", alias: ["z"], factor: 1e-3},
        {name: "yocto", alias: ["y"], factor: 1e-3},
    ].map(map);

    return createFactoredUnits(base, smaller) as any;
}

/**
 * Creates all the bigger prefixes for the given unit
 * @param base The base unit
 * @returns All the prefixed pure units
 */
export function createBiggerMetricUnits(
    base: IPureUnit
): [
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit,
    IPureUnit
] {
    function map({name, alias, factor}: IFactorUnitConfig): IFactorUnitConfig {
        return {
            name: name + base.identifier.name,
            alias: base.identifier.alias.map((a, i) => (alias?.[i] ?? "") + a),
            factor,
        };
    }
    const bigger = [
        {name: "deca", alias: ["da"], factor: 10},
        {name: "hecto", alias: ["h"], factor: 10},
        {name: "kilo", alias: ["k"], factor: 10},
        {name: "mega", alias: ["M"], factor: 1e3},
        {name: "giga", alias: ["G"], factor: 1e3},
        {name: "tera", alias: ["T"], factor: 1e3},
        {name: "peta", alias: ["P"], factor: 1e3},
        {name: "exa", alias: ["E"], factor: 1e3},
        {name: "zetta", alias: ["Z"], factor: 1e3},
        {name: "yotta", alias: ["Y"], factor: 1e3},
    ].map(map);

    return createFactoredUnits(base, bigger) as any;
}
