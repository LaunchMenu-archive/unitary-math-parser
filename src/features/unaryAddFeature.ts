import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {addToken, spaceToken} from "./tokens";
import {unarySubtractFeature} from "./unarySubtractFeature";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";

/**
 * The feature to take care of unary subtraction when encountering `-`
 */
export const unaryAddFeature = createFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {
        value: IRecursive<IASTExpression>;
    };
    name: "unary addition";
}>({
    name: "unary addition",
    parse: {
        tokens: [addToken, spaceToken],
        type: "prefix",
        exec({currentRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, addToken)));
            addChild(parser.subrule(2, currentRule));
            return finish();
        },
        precedence: {sameAs: [unarySubtractFeature]},
    },
    abstract: ({children: [op, value]}) => ({value}),
    recurse: ({value, ...rest}, recurse) => ({
        value: recurse(value),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {value: number},
            (node: {value: INumber}): INumber | IEvaluationErrorObject => node.value
        ),
    ],
});
