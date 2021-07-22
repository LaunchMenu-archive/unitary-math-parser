import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTBase} from "../_types/AST/IASTBase";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {multiplyFeature} from "./multiplyFeature";
import {addToken, spaceToken} from "./tokens";
import {createUnitaryValue} from "./util/createUnitaryValue";
import {checkDimensionMatch} from "./util/number/checkDimensionMatch";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

/**
 * The feature to take care of addition when encountering `+`
 */
export const addFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "add";
}>({
    name: "add",
    parse: {
        tokens: [addToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, addToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [multiplyFeature]},
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
                        node.source.children[2]
                    );
                    if (error) return error;

                    return {
                        value: left.value + left.unit.convert(right.value, right.unit)!,
                        unit: left.unit,
                    };
                })
        ),
    ],
});
