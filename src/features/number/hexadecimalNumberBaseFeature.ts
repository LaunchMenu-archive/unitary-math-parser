import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {hexNumberToken} from "../tokens";
import {createNumberBaseValueFormat} from "../util/formats/createBaseNumberFormats";
import {formatAugmentation} from "../util/formats/formatAugmentation";
import {number} from "../util/number/number";

const hex = createNumberBaseValueFormat(16, "hexadecimal");

/**
 * The feature to take care of reading hexadecimal numbers
 */
export const hexadecimalNumberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: number};
    name: "hexadecimal-number";
}>({
    name: "hexadecimal-number",
    parse: {
        tokens: [hexNumberToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, hexNumberToken)));
            return finish();
        },
    },
    abstract: ({children: [num]}) => {
        const val = hex.decode(num.text.slice(2));
        return {value: "value" in val ? val.value : 0};
    },
    recurse: node => node,
    evaluate: [
        createEvaluator({}, ({value}: {value: number}) =>
            number.create(value).augment(formatAugmentation, hex)
        ),
    ],
});
