import {Unit} from "../../features/util/number/Unit";
import {kilometer, meter} from "../../features/util/number/units/lengths";
import {joule} from "../../features/util/number/units/power";
import {second} from "../../features/util/number/units/times";
import {unitLess} from "../../features/util/number/units/unitLess";
import {kilogram} from "../../features/util/number/units/weight";
import {unitConfigContextIdentifier} from "../../features/variables/unitConfigContextIdentifier";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {expectResult} from "../resultCheck.helper";

describe("DivideFeature", () => {
    it("Should perform basic division", () => {
        expectResult("4 / 2", 2, unitLess);
    });
    it("Should combine units", () => {
        expectResult("4meter / 2second", 2, new Unit([meter], [second]));
    });
    describe("Simplification", () => {
        it("Should simplify units if possible", () => {
            expectResult("(4meter*second) / 2second", 2, new Unit([meter], []));
        });
        describe("Configuration", () => {
            it("Should allow conversion of units with the same dimension", () => {
                expectResult(
                    "4(1/meter) / 2kilometer",
                    0.002,
                    new Unit([], [meter, meter])
                );
                expectResult(
                    "4(1/meter) / 2kilometer",
                    2,
                    new Unit([], [meter, kilometer]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {convertUnits: false}}
                        ),
                    }
                );
            });
            it("Should allow expansion of units if it aids in canceling factors", () => {
                expectResult(
                    "4joule / 2meter",
                    2,
                    new Unit([kilogram, meter], [second, second]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {expandUnitsToCancelOut: true}}
                        ),
                    }
                );

                expectResult("4joule / 2meter", 2, new Unit([joule], [meter]), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {simplification: {expandUnitsToCancelOut: false}}
                    ),
                });

                expectResult("4joule / 2second", 2, new Unit([joule], [second]), {
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {simplification: {expandUnitsToCancelOut: true}}
                    ),
                });
            });
            it("Should allow expansion of units no matter what", () => {
                expectResult(
                    "4joule / 2second",
                    2,
                    new Unit([kilogram, meter, meter], [second, second, second]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {expandUnits: true}}
                        ),
                    }
                );

                expectResult(
                    "4joule / 2meter",
                    2,
                    new Unit([kilogram, meter], [second, second]),
                    {
                        context: new EvaluationContext().augment(
                            unitConfigContextIdentifier,
                            {simplification: {expandUnits: true}}
                        ),
                    }
                );
            });
            it("Should allow for sorting of units", () => {
                expectResult("4(1/kg) / 2meter", 2, new Unit([], [meter, kilogram]), {
                    ignoreOrder: false,
                });
                expectResult("4(1/meter) / 2kg", 2, new Unit([], [meter, kilogram]), {
                    ignoreOrder: false,
                });
                expectResult("4(1/kg) / 2meter", 2, new Unit([], [kilogram, meter]), {
                    ignoreOrder: false,
                    context: new EvaluationContext().augment(
                        unitConfigContextIdentifier,
                        {sortUnits: false}
                    ),
                });
            });
        });
    });
});
