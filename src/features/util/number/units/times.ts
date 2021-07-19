import {createDimension} from "../createDimension";
import {createFactoredUnits} from "../createFactoredUnits";
import {createSmallerMetricUnits} from "../createMetricUnits";

export const [time, second] = createDimension({
    name: "time",
    priority: 1,
    unit: {
        name: "second",
        alias: ["s", "seconds"],
    },
});

// https://en.wikipedia.org/wiki/Unit_of_time
const minuteToMonth = createFactoredUnits(second, [
    {name: "minute", alias: ["min", "minutes"], factor: 60},
    {name: "hour", alias: ["h", "hours"], factor: 60},
    {name: "day", alias: ["d", "days"], factor: 24},
    {name: "week", alias: ["weeks"], factor: 7},
    {name: "month", alias: ["months"], factor: 30},
]);
export const [minute, hour, day, week, month] = minuteToMonth;

const yearToAeon = createFactoredUnits(day, [
    {name: "year", alias: ["yr", "years"], factor: 365},
    {name: "decade", alias: ["decades"], factor: 10},
    {name: "century", alias: ["centuries"], factor: 10},
    {name: "millenium", alias: ["milleniums"], factor: 10},
    {name: "Megannum", alias: ["Megannums"], factor: 1e3},
    {name: "aeon", alias: ["aeons"], factor: 1e3},
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
    {name: "decasecond", alias: ["ds", "decaseconds"], factor: 10},
    {name: "hectosecond", alias: ["hs", "hectoseconds"], factor: 10},
    {name: "kilosecond", alias: ["ks", "kiloseconds"], factor: 10},
]);
export const [decasecond, hectosecond, kilosecond] = secondVariants;

const minuteVariants = createFactoredUnits(second, [
    {name: "decaminute", alias: ["decaminutes"], factor: 10},
    {name: "hectominute", alias: ["hectominutes"], factor: 10},
    {name: "kilominute", alias: ["kilominutes"], factor: 10},
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
