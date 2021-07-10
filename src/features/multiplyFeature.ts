import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {numberBaseFeature} from "./numberBaseFeature";

export const multiplyToken = createToken({name: "MULTIPLY", pattern: /\*/, label: '"*"'});
export const multiplyFeature = createFeature<{
    CST: [IASTExpression, ICSTLeaf, IASTExpression];
    AST: {factor1: IRecursive<IASTExpression>; factor2: IRecursive<IASTExpression>};
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
    abstract: ({children: [factor1, op, factor2]}) => ({
        factor1,
        factor2,
    }),
    recurse: ({factor1, factor2, ...rest}, recurse) => ({
        factor1: recurse(factor1),
        factor2: recurse(factor2),
        ...rest,
    }),
});
