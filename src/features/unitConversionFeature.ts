import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {createEvaluationError} from "../parser/AST/createEvaluationError";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTBase} from "../_types/AST/IASTBase";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {addFeature} from "./addFeature";
import {checkDimensionMatch} from "./util/number/checkDimensionMatch";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";
import {spaceToken, unitConversionToken} from "./tokens";

/**
 * The feature to convert from one unit to another when encountering `in`
 */
export const unitConversionFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: {
        value: IRecursive<IASTExpression>;
        unit: IRecursive<IASTExpression>;
    };
    name: "unitConversion";
}>({
    name: "unitConversion",
    parse: {
        tokens: [unitConversionToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, unitConversionToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [addFeature]},
    },
    abstract: ({children: [value, op, unit]}) => ({value, unit}),
    recurse: ({value, unit, ...rest}, recurse) => ({
        value: recurse(value),
        unit: recurse(unit),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {value: number, unit: number},
            (
                node: {value: INumber; unit: INumber} & IASTBase,
                context: EvaluationContext
            ): INumber | IEvaluationErrorObject =>
                createUnitaryValue(node, [node.value, node.unit], ([value, unit]) => {
                    const unitCST = node.source.children[2];
                    if (!unit.isPureUnit) {
                        return createEvaluationError(
                            {
                                type: "expectedUnit",
                                message: i =>
                                    `Received a value at index ${i} while only a unit was expected`,
                                multilineMessage: pm =>
                                    `Received a value while only a unit was expected:\n${pm}`,
                                source: unitCST,
                            },
                            context
                        );
                    }

                    const error = checkDimensionMatch(
                        value.unit,
                        unit.unit,
                        context,
                        unitCST
                    );
                    if (error) return error;

                    return {
                        value: unit.unit.convert(value.value, value.unit)!,
                        unit: unit.unit,
                    };
                })
        ),
    ],
});
