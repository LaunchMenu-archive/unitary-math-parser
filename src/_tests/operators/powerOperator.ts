import {Unit} from "../../features/util/number/Unit";
import {meter} from "../../features/util/number/units/lengths";
import {second} from "../../features/util/number/units/times";
import {expectError, expectResult} from "../resultCheck.helper";

describe("PowerFeature", () => {
    it("Should perform basic powers", () => {
        expectResult("4 ^ 3", 64);
        expectResult("4 ^ 0.5", 2);
        expectResult("4 ^ 1.5", 8);
    });
    it("Should compute integer powers of units", () => {
        expectResult("(4meter)^2", 16, new Unit([meter, meter], []));
        expectResult("(4meter)^3", 64, new Unit([meter, meter, meter], []));
        expectResult("4meter^3", 4, new Unit([meter, meter, meter], []));
        expectResult("(4meter/second)^2", 16, new Unit([meter, meter], [second, second]));
        expectResult("4meter^-3", 4, new Unit([], [meter, meter, meter]));
    });
    it("Should computer roots of units", () => {
        expectResult("(4meter*meter)^0.5", 2, new Unit([meter], []));
        expectError("(4meter*meter)^(1/3)", [
            {
                message: pt => `Incompatible unit found:\n${pt}\nMissing: length`,
                start: 0,
                end: 14,
            },
        ]);
        expectResult("(4meter*meter)^-0.5", 0.5, new Unit([], [meter]));
    });
    it("Can't have a unit in its exponent", () => {
        expectError("4^(3m)", [
            {
                message: pt =>
                    `Found value with wrong unit type:\n${pt}\nReceived: length, but expected unitless`,
                start: 2,
                end: 6,
            },
        ]);
    });
});
