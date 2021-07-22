import {Unit} from "../../features/util/number/Unit";
import {meter} from "../../features/util/number/units/lengths";
import {unitLess} from "../../features/util/number/units/unitLess";
import {expectError, expectResult} from "../resultCheck.helper";

describe("AddFeature", () => {
    it("Should perform basic addition", () => {
        expectResult("4 + 2", 6, unitLess);
    });
    it("Should check unit compatibility", () => {
        expectError("4meter + 2seconds", [
            {
                message: pt =>
                    `Incompatible unit found:\n${pt}\nMissing: length, Extra: time`,
                start: 9,
                end: 17,
            },
        ]);

        expectResult("4meter + 8meter", 12, new Unit([meter], []));
    });
    it("Should convert compatible units when necessary", () => {
        expectResult("4meter + 0.8decameter", 12, new Unit([meter], []));
    });
});
describe("UnaryAddFeature", () => {
    it("Shouldn't do anything", () => {
        expectResult("(+4) + 2", 6, unitLess);
    });
    it("Should keep the same unit", () => {
        expectResult("(+4m) + 2m", 6, new Unit([meter], []));
    });
});
