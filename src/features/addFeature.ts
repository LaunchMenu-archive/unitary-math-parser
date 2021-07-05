import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTRecursive} from "../_types/AST/IASTRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {multiplyFeature} from "./multiplyFeature";

export const addToken = createToken({name: "ADD", pattern: /\+/});
export const addFeature = createFeature<{
    CST: [IASTRecursive, ICSTLeaf, IASTRecursive];
    AST: {first: IASTRecursive; second: IASTRecursive};
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
