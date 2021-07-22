import {Unit} from "../../features/util/number/Unit";
import {meter} from "../../features/util/number/units/lengths";
import {second} from "../../features/util/number/units/times";
import {expectResult} from "../resultCheck.helper";

describe("ModFeature", () => {
    it("Should perform modulo", () => {
        expectResult("12 mod 3", 0);
        expectResult("12 mod 5", 2);
        expectResult("3 mod 5", 3);
    });
    it("Should properly deal with sign", () => {
        expectResult("4 mod 3", 1);
        expectResult("-4 mod 3", 2);
        expectResult("4 mod -3", -2);
        expectResult("-4 mod -3", -1);
    });
    it("Should return the LHS unit", () => {
        expectResult("4meter mod 3second", 1, new Unit([meter], []));
        expectResult("4meter mod 3(meter/second)", 1, new Unit([meter], []));
        expectResult("4meter mod 3meter second^-1", 1, new Unit([meter], []));
        // `/` has the same precedence as `mod`
        expectResult("4meter mod 3meter/second", 1, new Unit([meter], [second]));
    });
});
