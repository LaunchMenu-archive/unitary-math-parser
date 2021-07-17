import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {implicitMultiplyFeature, multiplyEvaluator} from "./implicitMultiplyFeature";
import {numberBaseFeature} from "./numberBaseFeature";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

export const multiplyToken = createToken({name: "MULTIPLY", pattern: /\*/, label: '"*"'});
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
        precedence: {lowerThan: [numberBaseFeature, implicitMultiplyFeature]},
    },
    abstract: ({children: [left, op, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [multiplyEvaluator],
});
