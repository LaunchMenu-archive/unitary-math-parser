import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {createEvaluationError} from "../parser/AST/createEvaluationError";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {isError} from "../parser/isError";
import {IASTBase} from "../_types/AST/IASTBase";
import {ICST} from "../_types/CST/ICST";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IDimension} from "../_types/evaluation/number/IDimension";
import {ILabeledPureUnit} from "../_types/evaluation/number/ILabeledPureUnit";
import {IPureUnit} from "../_types/evaluation/number/IPureUnit";
import {IUnit} from "../_types/evaluation/number/IUnit";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {IUnitFormat} from "../_types/evaluation/number/IUnitFormat";
import {numberBaseFeature} from "./numberBaseFeature";
import {createInvalidUnitError} from "./util/createInvalidUnitError";
import {createNumber} from "./util/number/createNumber";
import {getDimensionsString} from "./util/number/getDimensionsString";
import {isNumber} from "./util/number/isNumber";
import {getUnit} from "./util/number/Unit";
import {unitLess} from "./util/number/units/unitLess";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

export const powerToken = createToken({
    name: "POWER",
    pattern: /\^/,
    label: '"^"',
});

/**
 * The feature to take care of module when encountering `mod`
 */
export const powerFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "power";
}>({
    name: "power",
    parse: {
        tokens: [powerToken, spaceToken],
        type: "infix",
        associativity: "right",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, powerToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [numberBaseFeature]},
    },
    abstract: ({children: [left, op, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {left: isNumber, right: isNumber},
            (
                {
                    left,
                    right,
                    source,
                }: {
                    left: IUnitaryNumber;
                    right: IUnitaryNumber;
                } & IASTBase,
                context: EvaluationContext
            ): IUnitaryNumber | IEvaluationErrorObject => {
                // Make sure the right argument is unitless
                if (!right.unit.hasSameDimensions(unitLess))
                    return createInvalidUnitError({
                        received: left.unit,
                        options: [unitLess],
                        context,
                        source: source.children[2],
                    });

                // Just perform the power if no unit is present on the left
                if (left.unit.hasSameDimensions(unitLess))
                    return createNumber(
                        left.value ** right.value,
                        left.unit,
                        left.isUnit
                    );

                // Check whether it's a proper full power or full root
                const inverted = 1 / right.value;
                const roundErrorThreshold = 1e-10;
                if (
                    Math.abs(right.value % 1) > roundErrorThreshold &&
                    (Math.abs(inverted) < 1 ||
                        Math.abs(inverted % 1) > roundErrorThreshold)
                ) {
                    const message =
                        "No non-integer value is allowed as an exponent for a value with unit (except for properly defined roots)";
                    return createEvaluationError(
                        {
                            type: "unitWithPower",
                            message: i => `${message}. Found at index ${i}.`,
                            multilineMessage: pm => `${message}.\n${pm}`,
                            source: source.children[2],
                        },
                        context
                    );
                }

                // Perform the operation
                const isRoot = right.value < 1;
                if (isRoot) {
                    const degree = Math.round(inverted);
                    const newUnit = computeRootUnit(
                        left.unit,
                        degree,
                        source.children[0],
                        context
                    );
                    if (isError(newUnit)) return newUnit;

                    const value = newUnit.conversion.convert(left)!;
                    return createNumber(
                        value.value ** right.value,
                        newUnit.result,
                        left.isUnit
                    );
                } else {
                    const newUnit = computePowerUnit(left.unit, right.value);
                    return createNumber(left.value ** right.value, newUnit, left.isUnit);
                }
            }
        ),
    ],
});

/**
 * Obtains the new unit by multiplying the given unit by the specified degree
 * @param unit The unit to convert
 * @param degree The degree of the root
 * @returns The newly created unit
 */
export function computePowerUnit(unit: IUnit, degree: number): IUnit {
    let conversion: IUnitFormat = {
        numerator: [],
        denominator: [],
    };
    for (let i = 0; i < degree; i++) {
        conversion = {
            numerator: [...conversion.numerator, ...unit.numerator],
            denominator: [...conversion.denominator, ...unit.denominator],
        };
    }
    return unit.createNew(conversion);
}

/**
 * Obtains the new unit by dividing the given unit by the specified degree
 * @param unit The unit to convert
 * @param degree The degree of the root
 * @param source The source of the unit/value
 * @param context The context to get the input text from
 * @returns Either the result and conversion unit, or an error object
 */
export function computeRootUnit(
    unit: IUnit,
    degree: number,
    source: ICST,
    context: EvaluationContext
):
    | {
          /** The resulting unit after taking the root */
          result: IUnit;
          /** An intermediate unit to convert to such that dimensions use the same units */
          conversion: IUnit;
      }
    | IEvaluationErrorObject {
    // Find the resulting units and possibly missing units
    const divideUnits = (units: (IPureUnit | ILabeledPureUnit)[]) => {
        const result: (IPureUnit | ILabeledPureUnit)[] = [];
        const missingDimensions: IDimension[] = [];
        while (units.length > 0) {
            const unit = units.shift()!;
            result.push(unit);
            const dimension = getUnit(unit).dimension;
            for (let i = 1; i < degree; i++) {
                const index = units.findIndex(u => getUnit(u).dimension == dimension);
                if (index == -1) missingDimensions.push(dimension);
                else units.splice(index, 1);
            }
        }
        return {result, missingDimensions};
    };

    const dividedNumerator = divideUnits([...unit.numerator]);
    const dividedDenominator = divideUnits([...unit.denominator]);

    // Create an error message if applicable
    if (
        dividedNumerator.missingDimensions.length > 0 ||
        dividedDenominator.missingDimensions.length > 0
    ) {
        const missingDimensions = {
            numerator: dividedNumerator.missingDimensions,
            denominator: dividedDenominator.missingDimensions,
        };
        const missingDimensionsString = getDimensionsString(missingDimensions);
        return createEvaluationError(
            {
                type: "incompatiblePowerUnits",
                message: i =>
                    `Incompatible unit found at index ${i}; Missing: ${missingDimensionsString}`,
                multilineMessage: pm =>
                    `Incompatible unit found:\n${pm}\nMissing: ${missingDimensionsString}`,
                source,
            },
            context
        );
    }

    // Create the result unit and the conversion unit
    const result = unit.createNew({
        numerator: dividedNumerator.result,
        denominator: dividedDenominator.result,
    });
    return {result, conversion: computePowerUnit(result, degree)};
}
