import {approximationAugmentation} from "../../features/util/number/approximationAugmentation";
import {Unit} from "../../features/util/number/Unit";
import {meter} from "../../features/util/number/units/lengths";
import {unitLess} from "../../features/util/number/units/unitLess";
import {expectError, expectResult} from "../resultCheck.helper";

describe("FactorialFeature", () => {
    it("Should perform basic factorial", () => {
        expectResult("5!", 120);
        expectResult("3!", 6);
    });
    it("Should perform fraction results", () => {
        expectResult("5.5!", 287.8852780854823, unitLess, {
            check: value =>
                expect(value.getAugmentation(approximationAugmentation)).toBe(true),
        });
        expectResult("3!", 6, unitLess, {
            check: value =>
                expect(value.getAugmentation(approximationAugmentation)).toBe(false),
        });
    });
    it("Should error on invalid arguments", () => {
        expectError("(-1)!", [
            {message: sp => `Value must be non-negative:\n${sp}`, start: 0, end: 4},
        ]);
        expectError("(1.5meter)!", [
            {
                message: sp =>
                    `Value must be non-negative and an integer when the value has a unit:\n${sp}`,
                start: 0,
                end: 10,
            },
        ]);
    });
    it("Should compute the correct units", () => {
        expectResult("(5meter)!", 120, new Unit([meter, meter, meter, meter, meter], []));
        expectResult("(3meter)!", 6, new Unit([meter, meter, meter], []));
    });
});
