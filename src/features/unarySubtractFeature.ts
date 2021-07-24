import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTBase} from "../_types/AST/IASTBase";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {numberBaseFeature} from "./number/numberBaseFeature";
import {spaceToken, subtractToken} from "./tokens";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";

/**
 * The feature to take care of unary subtraction when encountering `-`
 */
export const unarySubtractFeature = createFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {
        value: IRecursive<IASTExpression>;
    };
    name: "unary subtract";
}>({
    name: "unary subtract",
    parse: {
        tokens: [subtractToken, spaceToken],
        type: "prefix",
        exec({currentRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, subtractToken)));
            addChild(parser.subrule(2, currentRule));
            return finish();
        },
        precedence: {
            lowerThan: [
                numberBaseFeature,
                // // Implicit multiplication has to have higher precedence or otherwise `4 - 4 = (4)(-4)`
                // implicitMultiplyFeature,
            ],
        },
    },
    abstract: ({children: [op, value]}) => ({value}),
    recurse: ({value, ...rest}, recurse) => ({
        value: recurse(value),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {value: number},
            (node: {value: INumber} & IASTBase): INumber | IEvaluationErrorObject =>
                number.create(-node.value.data, {node, values: [node.value]})
        ),
    ],
});
