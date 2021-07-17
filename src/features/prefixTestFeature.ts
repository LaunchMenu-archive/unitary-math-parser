import {createToken} from "chevrotain";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {addFeature} from "./addFeature";
import {multiplyFeature} from "./multiplyFeature";

export const prefixToken = createToken({name: "PREFIX", pattern: /\$/, label: '"$"'});
export const prefixAltToken = createToken({
    name: "PREFIXALT",
    pattern: /\#/,
    label: '"#"',
});
export const prefixAlt2Token = createToken({
    name: "PREFIXTALT2",
    pattern: /\@/,
    label: '"@"',
});
export const prefixFeature = createFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {val: IRecursive<IASTExpression>};
    name: "prefix";
}>({
    name: "prefix",
    parse: {
        tokens: [prefixToken, prefixAltToken, prefixAlt2Token],
        type: "prefix",
        exec({nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            const leaf = parser.or(0, [
                {ALT: () => createLeaf(parser.consume(0, prefixToken))},
                {ALT: () => createLeaf(parser.consume(0, prefixAltToken))},
                {
                    ALT: () => ({
                        ...createLeaf(parser.consume(0, prefixAlt2Token)),
                        type: prefixToken,
                        text: "$",
                        isRecovery: true,
                    }),
                },
            ]);
            addChild(leaf);
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: [addFeature]},
        correctionSuggestions: {
            getNodes: function* (node) {
                yield node;
                const leaf = node.children[0];
                if (!leaf.isRecovery) return;
                for (let [type, text] of [
                    [prefixToken, "$"],
                    [prefixAltToken, "#"],
                ] as const) {
                    if (type != leaf.type)
                        yield {
                            ...node,
                            children: [{...leaf, text, type}, node.children[1]],
                        };
                }
            },
        },
    },
    abstract: ({children: [op, val]}) => ({
        val,
    }),
    recurse: ({val, ...rest}, recurse) => ({val: recurse(val), ...rest}),
    evaluate: [],
});
