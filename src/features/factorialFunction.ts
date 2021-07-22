import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {createEvaluationError} from "../parser/AST/createEvaluationError";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {isError} from "../parser/isError";
import {IASTBase} from "../_types/AST/IASTBase";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {computePowerUnit, powerFeature} from "./powerFeature";
import {factorialToken, spaceToken} from "./tokens";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {approximationAugmentation} from "./util/number/approximationAugmentation";
import {number} from "./util/number/number";
import {unitLess} from "./util/number/units/unitLess";
import {INumber} from "./util/number/_types/INumber";

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
            {value: number},
            (
                node: {value: INumber} & IASTBase,
                context: EvaluationContext
            ): INumber | IEvaluationErrorObject => {
                const roundErrorThreshold = 1e-10;
                const isApprox = Math.abs(node.value.data % 1) > roundErrorThreshold;

                const res = createUnitaryValue(node, [node.value], ([value]) => {
                    // Just perform the power if no unit is present on the left
                    const isUnitLess = value.unit.hasSameDimensions(unitLess);
                    if (isUnitLess && value.value > 0)
                        return {
                            value: factorial(value.value).result,
                            unit: value.unit,
                        };

                    // Error if the value isn't allowed
                    if (value.value < 0 || value.value % 1 > roundErrorThreshold) {
                        const message = isUnitLess
                            ? "Value must be non-negative"
                            : "Value must be non-negative and an integer when the value has a unit";
                        return createEvaluationError(
                            {
                                type: "nonIntegerFactorial",
                                message: i => `${message}. Found at index ${i}.`,
                                multilineMessage: pm => `${message}:\n${pm}`,
                                source: node.source.children[0],
                            },
                            context
                        );
                    }

                    // Check whether it's a proper full power or full root
                    return {
                        value: factorial(Math.round(value.value)).result,
                        unit: computePowerUnit(value.unit, Math.round(value.value)),
                    };
                });

                if (isError(res)) return res;
                if (isApprox) return res.augment(approximationAugmentation, true);
                return res;
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
