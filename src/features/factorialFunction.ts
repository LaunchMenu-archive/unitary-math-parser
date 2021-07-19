import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {createEvaluationError} from "../parser/AST/createEvaluationError";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTBase} from "../_types/AST/IASTBase";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {computePowerUnit, powerFeature} from "./powerFeature";
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {unitLess} from "./util/number/units/unitLess";
import {spaceToken} from "./util/spaceToken";

export const factorialToken = createToken({
    name: "FACTORIAL",
    pattern: /\!/,
    label: '"!"',
});

/**
 * The feature to take care of module when encountering `mod`
 */
export const factorialFeature = createFeature<{
    CST: [IASTExpression, ICSTLeaf];
    AST: {
        value: IRecursive<IASTExpression>;
    };
    name: "factorial";
}>({
    name: "factorial",
    parse: {
        tokens: [factorialToken, spaceToken],
        type: "suffix",
        exec(node, {parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, factorialToken)));
            return finish();
        },
        precedence: {sameAs: [powerFeature]},
    },
    abstract: ({children: [value, op]}) => ({value}),
    recurse: ({value, ...rest}, recurse) => ({
        value: recurse(value),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {value: isNumber},
            (
                {
                    value: {unit, value, isUnit},
                    source,
                }: {
                    value: IUnitaryNumber;
                } & IASTBase,
                context: EvaluationContext
            ): IUnitaryNumber | IEvaluationErrorObject => {
                // Just perform the power if no unit is present on the left
                if (unit.hasSameDimensions(unitLess))
                    return createNumber(factorial(value).result, unit, isUnit);

                // Error if the value isn't allowed
                const roundErrorThreshold = 1e-10;
                if (Math.abs(value % 1) > roundErrorThreshold || value < 0) {
                    const message =
                        "Value must be non-negative and an integer when the value has a unit";
                    return createEvaluationError(
                        {
                            type: "nonIntegerFactorial",
                            message: i => `${message}. Found at index ${i}.`,
                            multilineMessage: pm => `${message}.\n${pm}`,
                            source: source.children[2],
                        },
                        context
                    );
                }

                // Check whether it's a proper full power or full root
                return createNumber(
                    factorial(Math.round(value)).result,
                    computePowerUnit(unit, Math.round(value)),
                    isUnit
                );
            }
        ),
    ],
});

/**
 * Calculates the factorial of a number. If the number `n` is a non-integer (or >= 171) the digamma approximation is used instead.
 * @param n Number to calculate the factorial of
 */
export function factorial(n: number): {result: number; approx: boolean} {
    if (Math.floor(n) == n && n < 171) {
        let val = 1;
        while (n > 1) val = val * n--;
        return {result: val, approx: false};
    } else {
        //Use digamma
        let approximation =
            Math.sqrt(2 * Math.PI) *
            Math.exp(-n - 1) *
            Math.sqrt(1 / (n + 1)) *
            ((n + 1) *
                Math.sqrt(1 / (810 * (n + 1) ** 6) + (n + 1) * Math.sinh(1 / (n + 1)))) **
                (n + 1);
        return {result: approximation, approx: true};
    }
}
