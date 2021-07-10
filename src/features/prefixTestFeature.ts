import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {addFeature} from "./addFeature";
import {multiplyFeature} from "./multiplyFeature";

export const prefixToken = createToken({name: "PREFIX", pattern: /\$/, label: '"$"'});
export const prefixFeature = createFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {val: IRecursive<IASTExpression>};
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
    abstract: ({children: [op, val]}) => ({
        val,
    }),
    recurse: ({val, ...rest}, recurse) => ({val: recurse(val), ...rest}),
});
