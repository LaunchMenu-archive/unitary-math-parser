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
import {IUnitFormat} from "../_types/evaluation/number/IUnitFormat";
import {numberBaseFeature} from "./number/numberBaseFeature";
import {createInvalidUnitError} from "./util/createInvalidUnitError";
import {getDimensionsString} from "./util/number/getDimensionsString";
import {number} from "./util/number/number";
import {getUnit} from "./util/number/Unit";
import {unitLess} from "./util/number/units/unitLess";
import {INumber} from "./util/number/_types/INumber";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";
import {unarySubtractFeature} from "./unarySubtractFeature";
import {powerToken, spaceToken} from "./tokens";

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
        precedence: {lowerThan: [numberBaseFeature, unarySubtractFeature]},
    },
    abstract: ({children: [left, op, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {left: number, right: number},
            (
                node: {
                    left: INumber;
                    right: INumber;
                } & IASTBase,
                context: EvaluationContext
            ): INumber | IEvaluationErrorObject =>
                createUnitaryValue(node, [node.left, node.right], ([left, right]) => {
                    const rightSource = node.source.children[2];
                    const leftSource = node.source.children[0];

                    // Make sure the right argument is unitless
                    if (!right.unit.hasSameDimensions(unitLess))
                        return createInvalidUnitError({
                            received: right.unit,
                            options: [unitLess],
                            context,
                            source: rightSource,
                        });

                    // Just perform the power if no unit is present on the left
                    if (left.unit.hasSameDimensions(unitLess))
                        return {
                            value: left.value ** right.value,
                            unit: left.unit,
                        };

                    // Check whether it's a proper full power or full root
                    const inverted = 1 / right.value;
                    const roundErrorThreshold = 1e-10;
                    if (
                        Math.abs(right.value) % 1 > roundErrorThreshold &&
                        (Math.abs(inverted) < 1 ||
                            Math.abs(inverted) % 1 > roundErrorThreshold)
                    ) {
                        const message =
                            "No non-integer value is allowed as an exponent for a value with unit (except for properly defined roots)";
                        return createEvaluationError(
                            {
                                type: "unitWithPower",
                                message: i => `${message}. Found at index ${i}.`,
                                multilineMessage: pm => `${message}.\n${pm}`,
                                source: rightSource,
                            },
                            context
                        );
                    }

                    // Perform the operation
                    const isRoot = Math.abs(right.value) < 1;
                    if (isRoot) {
                        const degree = Math.round(inverted);
                        const newUnit = computeRootUnit(
                            left.unit,
                            degree,
                            leftSource,
                            context
                        );
                        if (isError(newUnit)) return newUnit;

                        const value = newUnit.conversion.convert(left.value, left.unit)!;
                        return {value: value ** right.value, unit: newUnit.result};
                    } else {
                        const newUnit = computePowerUnit(left.unit, right.value);
                        return {value: left.value ** right.value, unit: newUnit};
                    }
                })
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
    for (let i = 0; i < Math.abs(degree); i++) {
        conversion = {
            numerator: [...conversion.numerator, ...unit.numerator],
            denominator: [...conversion.denominator, ...unit.denominator],
        };
    }
    if (degree < 0)
        conversion = {
            numerator: conversion.denominator,
            denominator: conversion.numerator,
        };
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
            for (let i = 1; i < Math.abs(degree); i++) {
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
        numerator: degree < 0 ? dividedDenominator.result : dividedNumerator.result,
        denominator: degree < 0 ? dividedNumerator.result : dividedDenominator.result,
    });
    return {result, conversion: computePowerUnit(result, degree)};
}
