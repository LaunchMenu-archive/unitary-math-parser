import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {createEvaluationError} from "../parser/AST/createEvaluationError";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTBase} from "../_types/AST/IASTBase";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTNode} from "../_types/CST/ICSTNode";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {addFeature} from "./addFeature";
import {checkDimensionMatch} from "./util/number/checkDimensionMatch";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";
import {textToken} from "./variables/varBaseFeature";

export const unitConversionToken = createToken({
    name: "IN",
    pattern: /in/i,
    label: '"in"',
    longer_alt: textToken,
});

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
            {value: isNumber, unit: isNumber},
            (
                {
                    value,
                    unit,
                    source,
                }: {value: IUnitaryNumber; unit: IUnitaryNumber} & IASTBase,
                context: EvaluationContext
            ): IUnitaryNumber | IEvaluationErrorObject => {
                if (!unit.isUnit) {
                    return createEvaluationError(
                        {
                            type: "expectedUnit",
                            message: i =>
                                `Received a value at index ${i} while only a unit was expected`,
                            multilineMessage: pm =>
                                `Received a value while only a unit was expected:\n${pm}`,
                            source: source.children[2] as ICSTNode,
                        },
                        context
                    );
                }

                const error = checkDimensionMatch(
                    value.unit,
                    unit.unit,
                    context,
                    source.children[2] as ICSTNode
                );
                if (error) return error;

                return unit.unit.convert(value)!;
            }
        ),
    ],
});
