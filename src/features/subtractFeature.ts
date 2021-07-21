import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTBase} from "../_types/AST/IASTBase";
import {ICSTNode} from "../_types/CST/ICSTNode";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {addFeature} from "./addFeature";
import {subtractToken} from "./unarySubtractFeature";
import {checkDimensionMatch} from "./util/number/checkDimensionMatch";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";
import {spaceToken} from "./util/spaceToken";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

/**
 * The feature to take care of subtraction when encountering `-`
 */
export const subtractFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "subtract";
}>({
    name: "subtract",
    parse: {
        tokens: [subtractToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, subtractToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: [addFeature]},
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
                context
            ): INumber | IEvaluationErrorObject =>
                createUnitaryValue(node, [node.left, node.right], ([left, right]) => {
                    const error = checkDimensionMatch(
                        left.unit,
                        right.unit,
                        context,
                        node.source.children[2] as ICSTNode
                    );
                    if (error) return error;

                    return {
                        value: left.value - left.unit.convert(right.value, right.unit)!,
                        unit: left.unit,
                    };
                })
        ),
    ],
});
