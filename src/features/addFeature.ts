import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {multiplyFeature} from "./multiplyFeature";

export const addToken = createToken({name: "ADD", pattern: /\+/, label: '"+"'});
export const addFeature = createFeature<{
    CST: [IASTExpression, ICSTLeaf, IASTExpression];
    AST: {first: IASTExpression; second: IASTExpression};
    name: "add";
}>({
    name: "add",
    parse: {
        tokens: [addToken],
        type: "suffix",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, addToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: multiplyFeature},
    },
    abstract({children: [first, op, second]}, source) {
        return {
            first,
            second,
            source,
        };
    },
});
