import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createEvaluator} from "../createEvaluator";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {number} from "./util/number/number";

export const numberToken = createToken({
    name: "NUMBER",
    pattern: /(\d*\.)?\d+/,
    label: "number",
});

/**
 * The feature to take care of reading numbers
 */
export const numberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: number};
    name: "number";
}>({
    name: "number",
    parse: {
        tokens: [numberToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, numberToken)));
            return finish();
        },
    },
    abstract: ({children: [child]}) => ({
        value: parseFloat(child.text),
    }),
    recurse: node => node,
    evaluate: [createEvaluator({}, ({value}: {value: number}) => number.create(value))],
});
