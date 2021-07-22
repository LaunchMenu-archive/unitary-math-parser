import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IASTBase} from "../_types/AST/IASTBase";
import {multiplyFeature} from "./multiplyFeature";
import {divideToken, spaceToken} from "./tokens";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";
import {unitConfigContextIdentifier} from "./variables/unitConfigContextIdentifier";
/**
 * The feature to take care of division when encountering `/`
 */
export const divideFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "divide";
}>({
    name: "divide",
    parse: {
        tokens: [divideToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, divideToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: [multiplyFeature]},
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
            ) =>
                createUnitaryValue(node, [node.left, node.right], ([left, right]) => {
                    const unitConfig = context.get(unitConfigContextIdentifier);

                    const isUnit = left.isPureUnit && right.isPureUnit;
                    const unit = left.unit.createNew(
                        {
                            numerator: [
                                ...left.unit.numerator,
                                ...right.unit.denominator,
                            ],
                            denominator: [
                                ...left.unit.denominator,
                                ...right.unit.numerator,
                            ],
                        },
                        {sortUnits: !isUnit && unitConfig.sortUnits !== false}
                    );
                    const simplifiedUnit = unit.simplify(unitConfig.simplification);
                    return {
                        value: simplifiedUnit.convert(left.value / right.value, unit)!,
                        unit: simplifiedUnit,
                    };
                })
        ),
    ],
});
