import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IUnit} from "../_types/evaluation/number/IUnit";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {numberBaseFeature} from "./numberBaseFeature";
import {unarySubtractFeature} from "./unarySubtractFeature";
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {unitLess} from "./util/number/units/unitLess";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {unitConfigContextIdentifier} from "./variables/unitConfigContextIdentifier";

export const multiplyEvaluator = createEvaluator(
    {left: isNumber, right: isNumber},
    (
        {left, right}: {left: IUnitaryNumber; right: IUnitaryNumber},
        context: EvaluationContext
    ): IUnitaryNumber => {
        const unitConfig = context.get(unitConfigContextIdentifier);
        const isUnit = left.isUnit && right.isUnit;

        const rawUnit = left.unit.createNew(
            {
                numerator: [...left.unit.numerator, ...right.unit.numerator],
                denominator: [...left.unit.denominator, ...right.unit.denominator],
            },
            {sortUnits: !isUnit && unitConfig.sortUnits}
        );

        // If the unit is dimensionless we want to just drop one, E.g. 50% * 50% = 25%, not 2500 %^2. Otherwise we just simplify the unit by canceling out some numerators and denominators if possible
        let unit: IUnit;
        if (!unitConfig.removeDimensionlessFactors) {
            unit = rawUnit.simplify(unitConfig.simplification);
        } else if (
            right.unit.hasSameDimensions(unitLess) &&
            !right.isUnit &&
            !right.unit.equals(unitLess)
        ) {
            unit = left.unit;
        } else if (left.unit.hasSameDimensions(unitLess) && !left.isUnit) {
            unit = right.unit;
        } else {
            unit = rawUnit.simplify(unitConfig.simplification);
        }

        return unit.convert(createNumber(left.value * right.value, rawUnit, isUnit))!;
    }
);

/**
 * The feature to take care of multiplication when encountering two consequent values, E.g. 5(10) = 50
 */
export const implicitMultiplyFeature = createFeature<{
    CST: [IASTExpression, IASTExpression];
    AST: IBinaryASTData;
    name: "implicitMultiply";
}>({
    name: "implicitMultiply",
    parse: {
        tokens: [spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [numberBaseFeature]},
    },
    abstract: ({children: [left, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [multiplyEvaluator],
});
