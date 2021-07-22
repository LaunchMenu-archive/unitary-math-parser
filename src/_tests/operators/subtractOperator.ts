import {Unit} from "../../features/util/number/Unit";
import {meter} from "../../features/util/number/units/lengths";
import {unitLess} from "../../features/util/number/units/unitLess";
import {expectError, expectResult} from "../resultCheck.helper";

describe("SubtractFeature", () => {
    it("Should perform basic subtraction", () => {
        expectResult("4 - 2", 2, unitLess);
    });
    it("Should check unit compatibility", () => {
        expectError("4meter - 2seconds", [
            {
                message: pt =>
                    `Incompatible unit found:\n${pt}\nMissing: length, Extra: time`,
                start: 9,
                end: 17,
            },
        ]);

        expectResult("4meter - 8meter", -4, new Unit([meter], []));
    });
    it("Should convert compatible units when necessary", () => {
        expectResult("4meter - 0.8decameter", -4, new Unit([meter], []));
    });
});
describe("UnaryAddFeature", () => {
    it("Should invert the number", () => {
        expectResult("(-4) + 2", -2, unitLess);
        expectResult("(--4) + 2", 6, unitLess);
        expectResult("(---4) + 2", -2, unitLess);
    });
    it("Should keep the same unit", () => {
        expectResult("(-4m) + 2m", -2, new Unit([meter], []));
    });
});
