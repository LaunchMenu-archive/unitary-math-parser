import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTRecursive} from "../_types/AST/IASTRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {numberBaseFeature} from "./numberBaseFeature";

export const multiplyToken = createToken({name: "MULTIPLY", pattern: /\*/});
export const multiplyFeature = createFeature<{
    CST: [IASTRecursive, ICSTLeaf, IASTRecursive];
    AST: {factor1: IASTRecursive; factor2: IASTRecursive};
    name: "multiply";
}>({
    name: "multiply",
    parse: {
        tokens: [multiplyToken],
        type: "suffix",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, multiplyToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: numberBaseFeature},
    },
    abstract({children: [factor1, op, factor2]}, source) {
        return {
            factor1,
            factor2,
            source,
        };
    },
});
