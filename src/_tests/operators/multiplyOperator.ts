import {Unit} from "../../features/util/number/Unit";
import {kilometer, meter} from "../../features/util/number/units/lengths";
import {joule} from "../../features/util/number/units/power";
import {percentage} from "../../features/util/number/units/ratio";
import {second} from "../../features/util/number/units/times";
import {unitLess} from "../../features/util/number/units/unitLess";
import {kilogram} from "../../features/util/number/units/weight";
import {unitConfigContextIdentifier} from "../../features/variables/unitConfigContextIdentifier";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {expectResult} from "../resultCheck.helper";

describe("MultiplyFeature", () => {
    it("Should perform basic multiplication", () => {
        expectResult("4 * 2", 8, unitLess);
    });
    it("Should combine units", () => {
        expectResult("4meter * 2second", 8, new Unit([meter, second], []));
    });
    describe("Simplification", () => {
        it("Should simplify units if possible", () => {
            expectResult("(4meter/second) * 2second", 8, new Unit([meter], []));
        });
        describe("Configuration", () => {
            it("Should allow conversion of units with the same dimension", () => {
                expectResult("4meter * 2kilometer", 8000, new Unit([meter, meter], []));
                expectResult("4meter * 2kilometer", 8, new Unit([meter, kilometer], []), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {simplification: {convertUnits: false}}
                    ),
                });
            });
            it("Should allow expansion of units if it aids in canceling factors", () => {
                expectResult(
                    "4joule * 2second",
                    8,
                    new Unit([kilogram, meter, meter], [second]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {expandUnitsToCancelOut: true}}
                        ),
                    }
                );

                expectResult("4joule * 2second", 8, new Unit([joule, second], []), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {simplification: {expandUnitsToCancelOut: false}}
                    ),
                });

                expectResult("4joule * 2meter", 8, new Unit([joule, meter], []), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {simplification: {expandUnitsToCancelOut: true}}
                    ),
                });
            });
            it("Should allow expansion of units no matter what", () => {
                expectResult(
                    "4joule * 2second",
                    8,
                    new Unit([kilogram, meter, meter], [second]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {expandUnits: true}}
                        ),
                    }
                );

                expectResult(
                    "4joule * 2meter",
                    8,
                    new Unit([kilogram, meter, meter, meter], [second, second]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {expandUnits: true}}
                        ),
                    }
                );
            });
            it("Should allow for sorting of units", () => {
                expectResult("4kg * 2meter", 8, new Unit([meter, kilogram], []), {
                    ignoreOrder: false,
                });
                expectResult("4meter * 2kg", 8, new Unit([meter, kilogram], []), {
                    ignoreOrder: false,
                });
                expectResult("4kg * 2meter", 8, new Unit([kilogram, meter], []), {
                    ignoreOrder: false,
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {sortUnits: false}
                    ),
                });
            });

            it("Should simplify unitless values", () => {
                expectResult("50% * 50%", 25, new Unit([percentage], []));
                expectResult("50% * 50%", 2500, new Unit([percentage, percentage], []), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {removeDimensionlessFactors: false}
                    ),
                });

                expectResult("18 * 50%", 9, new Unit([], []));
                expectResult("50% * 18", 9, new Unit([], []));
                expectResult("18 * 50%", 900, new Unit([percentage], []), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {removeDimensionlessFactors: false}
                    ),
                });
                expectResult("50% * 18", 900, new Unit([percentage], []), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {removeDimensionlessFactors: false}
                    ),
                });
            });
        });
    });
});
