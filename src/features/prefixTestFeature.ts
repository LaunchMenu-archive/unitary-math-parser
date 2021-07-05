import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTRecursive} from "../_types/AST/IASTRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {addFeature} from "./addFeature";
import {multiplyFeature} from "./multiplyFeature";

export const prefixToken = createToken({name: "prefix", pattern: /\$/});
export const prefixFeature = createFeature<{
    CST: [ICSTLeaf, IASTRecursive];
    AST: {val: IASTRecursive};
    name: "prefix";
}>({
    name: "prefix",
    parse: {
        tokens: [prefixToken],
        type: "prefix",
        exec({nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, prefixToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: addFeature},
    },
    abstract({children: [op, val]}, source) {
        return {
            val,
            source,
        };
    },
});
