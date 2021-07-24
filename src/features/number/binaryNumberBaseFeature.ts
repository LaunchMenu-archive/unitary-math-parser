import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {binaryNumberToken} from "../tokens";
import {createNumberBaseValueFormat} from "../util/formats/createBaseNumberFormats";
import {formatAugmentation} from "../util/formats/formatAugmentation";
import {number} from "../util/number/number";

const binary = createNumberBaseValueFormat(2, "binary");

/**
 * The feature to take care of reading binary numbers
 */
export const binaryNumberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: number};
    name: "binary-number";
}>({
    name: "binary-number",
    parse: {
        tokens: [binaryNumberToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, binaryNumberToken)));
            return finish();
        },
    },
    abstract: ({children: [num]}) => {
        const val = binary.decode(num.text.slice(2));
        return {value: "value" in val ? val.value : 0};
    },
    recurse: node => node,
    evaluate: [
        createEvaluator({}, ({value}: {value: number}) =>
            number.create(value).augment(formatAugmentation, binary)
        ),
    ],
});
