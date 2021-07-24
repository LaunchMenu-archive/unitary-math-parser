import {createFeature} from "../createFeature";
import {implicitMultiplyFeature, multiplyEvaluator} from "./implicitMultiplyFeature";
import {numberBaseFeature} from "./number/numberBaseFeature";
import {powerFeature} from "./powerFeature";
import {multiplyToken, spaceToken} from "./tokens";
import {unarySubtractFeature} from "./unarySubtractFeature";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

/**
 * The feature to take care of multiplication when encountering `*`
 */
export const multiplyFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "multiply";
}>({
    name: "multiply",
    parse: {
        tokens: [multiplyToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, multiplyToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {
            lowerThan: [
                numberBaseFeature,
                implicitMultiplyFeature,
                unarySubtractFeature,
                powerFeature,
            ],
        },
    },
    abstract: ({children: [left, op, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [multiplyEvaluator],
});
