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
import {spaceToken, conversionToken} from "./tokens";
import {valueFormat} from "./util/formats/valueFormat";
import {IFormat} from "./util/formats/_types/IFormat";
import {formatAugmentation} from "./util/formats/formatAugmentation";

/**
 * The feature to convert from one unit or format to another when encountering `in`
 */
export const conversionFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: {
        value: IRecursive<IASTExpression>;
        to: IRecursive<IASTExpression>;
    };
    name: "conversion";
}>({
    name: "conversion",
    parse: {
        tokens: [conversionToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, conversionToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [addFeature]},
    },
    abstract: ({children: [value, op, unit]}) => ({value, to: unit}),
    recurse: ({value, to: unit, ...rest}, recurse) => ({
        value: recurse(value),
        to: recurse(unit),
        ...rest,
    }),
    evaluate: [
        // Unit conversion
        createEvaluator(
            {value: number, to: number},
            (
                node: {value: INumber; to: INumber} & IASTBase,
                context: EvaluationContext
            ): INumber | IEvaluationErrorObject =>
                createUnitaryValue(node, [node.value, node.to], ([value, unit]) => {
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
        // Format conversion
        createEvaluator(
            {value: number, to: valueFormat},
            (
                {value, to, source}: {value: INumber; to: IFormat} & IASTBase,
                context: EvaluationContext
            ): INumber | IEvaluationErrorObject => {
                if (!value.isA(to.data.dataType)) {
                    return createEvaluationError(
                        {
                            type: "invalidFormat",
                            message: i =>
                                `Received an incompatible format at index ${i}. Expected a format for a ${to.data.dataType.name}.`,
                            multilineMessage: pm =>
                                `Received an incompatible format:\n${pm}\nExpected a format for a ${to.data.dataType.name}`,
                            source: source.children[2],
                        },
                        context
                    );
                }

                return value.augment(formatAugmentation, to.data);
            }
        ),
    ],
});
