import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {numberToken, subtractToken, textToken} from "../tokens";
import {number} from "../util/number/number";

/**
 * The feature to take care of reading numbers without support for different formats
 */
export const numberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, ICSTLeaf, ICSTLeaf, ICSTLeaf];
    AST: {value: number};
    name: "number";
}>({
    name: "number",
    parse: {
        tokens: [numberToken, textToken, subtractToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, numberToken)));

            // Deal with scientific notation (10e3, 10e-4)
            const next = parser.LA(1);
            if (
                next.tokenType == textToken &&
                (next.image.match(/^e\-?\d+$/i) ||
                    (next.image.match(/^e$/i) &&
                        parser.LA(2).tokenType == subtractToken &&
                        parser.LA(3).tokenType == numberToken))
            ) {
                addChild(createLeaf(parser.consume(1, textToken)));
                if (next.image.match(/^e$/i)) {
                    addChild(createLeaf(parser.consume(1, subtractToken)));
                    addChild(createLeaf(parser.consume(2, numberToken)));
                }
            }

            return finish();
        },
    },
    abstract: ({children: [num, exp, neg, expNum]}) => ({
        value: parseFloat(
            num.text + (exp?.text ?? "") + (neg?.text ?? "") + (expNum?.text ?? "")
        ),
    }),
    recurse: node => node,
    evaluate: [createEvaluator({}, ({value}: {value: number}) => number.create(value))],
});
