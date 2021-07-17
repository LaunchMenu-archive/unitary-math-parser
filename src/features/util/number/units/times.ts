import {createDimension} from "../createDimension";
import {createFactoredUnits} from "../createFactoredUnits";
import {createSmallerMetricUnits} from "../createMetricUnits";

export const [time, second] = createDimension({
    name: "time",
    priority: 1,
    unit: {
        name: "second",
        alias: ["s"],
    },
});

// https://en.wikipedia.org/wiki/Unit_of_time
const minuteToMonth = createFactoredUnits(second, [
    {name: "minute", alias: ["min"], factor: 60},
    {name: "hour", alias: ["h"], factor: 60},
    {name: "day", alias: ["d"], factor: 24},
    {name: "week", factor: 7},
    {name: "month", factor: 30},
]);
export const [minute, hour, day, week, month] = minuteToMonth;

const yearToAeon = createFactoredUnits(day, [
    {name: "year", alias: ["yr"], factor: 365},
    {name: "decade", factor: 10},
    {name: "century", factor: 10},
    {name: "millenium", factor: 10},
    {name: "Megannum", factor: 1e3},
    {name: "aeon", factor: 1e3},
]);
export const [year, decade, century, millennium, Megannum, aeon] = yearToAeon;

const smallerTimes = createSmallerMetricUnits(second);
export const [
    decisecond,
    centisecond,
    millisecond,
    microsecond,
    nanosecond,
    picosecond,
    femtosecond,
    attosecond,
    zeptosecond,
    yoctosecond,
] = smallerTimes;

const secondVariants = createFactoredUnits(second, [
    {name: "decasecond", alias: ["ds"], factor: 10},
    {name: "hectosecond", alias: ["hs"], factor: 10},
    {name: "kilosecond", alias: ["ks"], factor: 10},
]);
export const [decasecond, hectosecond, kilosecond] = secondVariants;

const minuteVariants = createFactoredUnits(second, [
    {name: "decaminute", factor: 10},
    {name: "hectominute", factor: 10},
    {name: "kilominute", factor: 10},
]);
export const [decaminute, hectominute, kilominute] = minuteVariants;

export const times = [
    second,
    ...minuteToMonth,
    ...yearToAeon,
    ...smallerTimes,
    ...secondVariants,
    ...minuteVariants,
];
