import {Unit} from "../features/util/number/Unit";
import {decameter, kilometer} from "../features/util/number/units/lengths";
import {unitLess} from "../features/util/number/units/unitLess";
import {IUnit} from "../_types/evaluation/number/IUnit";
import {expectResult} from "./resultCheck.helper";

describe("Random expressions", () => {
    const expressions: {
        expression: string;
        value: number;
        unit?: IUnit;
        config?: typeof expectResult extends (a: any, b: any, c: any, d: infer U) => any
            ? U
            : never;
    }[] = [
        {
            expression: "(5km/hour - 1meter/second + .1km/hour)*20min",
            value: 0.5,
            unit: new Unit([kilometer], []),
        },
        {
            expression: "150 * (100-30)%",
            value: 105,
            unit: unitLess,
        },
        {
            expression: "5km + 20meter + 3dam - 5m in dam",
            value: 504.5,
            unit: new Unit([decameter], []),
        },
        {
            expression: "year/day",
            value: 365,
            unit: unitLess,
        },
    ];

    for (let {expression, value, unit, config} of expressions) {
        it(`Should handle "${expression}"`, () => {
            expectResult(expression, value, unit, config);
        });
    }
});
