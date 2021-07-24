import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTBase} from "../_types/AST/IASTBase";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IUnit} from "../_types/evaluation/number/IUnit";
import {numberBaseFeature} from "./number/numberBaseFeature";
import {powerFeature} from "./powerFeature";
import {addToken, spaceToken, subtractToken} from "./tokens";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {number} from "./util/number/number";
import {unitLess} from "./util/number/units/unitLess";
import {INumber} from "./util/number/_types/INumber";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {unitConfigContextIdentifier} from "./variables/unitConfigContextIdentifier";

export const multiplyEvaluator = createEvaluator(
    {left: number, right: number},
    (
        node: {left: INumber; right: INumber} & IASTBase,
        context: EvaluationContext
    ): INumber | IEvaluationErrorObject =>
        createUnitaryValue(node, [node.left, node.right], ([left, right]) => {
            const unitConfig = context.get(unitConfigContextIdentifier);
            const isUnit = left.isPureUnit && right.isPureUnit;

            const rawUnit = left.unit.createNew(
                {
                    numerator: [...left.unit.numerator, ...right.unit.numerator],
                    denominator: [...left.unit.denominator, ...right.unit.denominator],
                },
                {sortUnits: !isUnit && unitConfig.sortUnits !== false}
            );

            // If the unit is dimensionless we want to just drop one, E.g. 50% * 50% = 25%, not 2500 %^2. Otherwise we just simplify the unit by canceling out some numerators and denominators if possible
            let unit: IUnit;
            if (unitConfig.removeDimensionlessFactors == false) {
                unit = rawUnit.simplify(unitConfig.simplification);
            } else if (
                right.unit.hasSameDimensions(unitLess) &&
                !right.isPureUnit &&
                !right.unit.equals(unitLess)
            ) {
                unit = left.unit;
            } else if (left.unit.hasSameDimensions(unitLess) && !left.isPureUnit) {
                unit = right.unit;
            } else {
                unit = rawUnit.simplify(unitConfig.simplification);
            }

            return {value: unit.convert(left.value * right.value, rawUnit)!, unit};
        })
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
        type: "suffix",
        exec(node, {nextRule, parser, createNode}) {
            const {addChild, finish} = createNode();
            // Deal with unary subtract/addition features
            if ([addToken, subtractToken].includes(parser.LA(1).tokenType)) return node;
            addChild(node);
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [numberBaseFeature, powerFeature]},
    },
    abstract: ({children: [left, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [multiplyEvaluator],
});
