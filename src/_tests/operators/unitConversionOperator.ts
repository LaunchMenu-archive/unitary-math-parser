import {Unit} from "../../features/util/number/Unit";
import {kilometer, meter} from "../../features/util/number/units/lengths";
import {percentage} from "../../features/util/number/units/ratio";
import {hour, second} from "../../features/util/number/units/times";
import {expectError, expectResult} from "../resultCheck.helper";

describe("UnitConversionFeature", () => {
    it("Should convert units if compatible", () => {
        expectResult("1km/hour in meter/second", 1 / 3.6, new Unit([meter], [second]));
        expectResult("15km/hour in meter/second", 15 / 3.6, new Unit([meter], [second]));
        expectResult("1meter/second in km/hour", 3.6, new Unit([kilometer], [hour]));
        expectResult("1.5 in %", 150, new Unit([percentage], []));
    });
    it("Should error if units are incompatible", () => {
        expectError("15km/hour in second/meter", [
            {
                message: sp =>
                    `Incompatible unit found:\n${sp}\nMissing: length/time, Extra: time/length`,
                start: 13,
                end: 25,
            },
        ]);
        expectError("15km/hour in meter", [
            {
                message: sp => `Incompatible unit found:\n${sp}\nMissing: 1/time`,
                start: 13,
                end: 18,
            },
        ]);
    });
});
