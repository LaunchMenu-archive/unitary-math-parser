import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {octalNumberToken} from "../tokens";
import {createNumberBaseValueFormat} from "../util/formats/createBaseNumberFormats";
import {formatAugmentation} from "../util/formats/formatAugmentation";
import {number} from "../util/number/number";

const octal = createNumberBaseValueFormat(8, "octal");

/**
 * The feature to take care of reading octal numbers
 */
export const octalNumberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: number};
    name: "octal-number";
}>({
    name: "octal-number",
    parse: {
        tokens: [octalNumberToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, octalNumberToken)));
            return finish();
        },
    },
    abstract: ({children: [num]}) => {
        const val = octal.decode(num.text.slice(2));
        return {value: "value" in val ? val.value : 0};
    },
    recurse: node => node,
    evaluate: [
        createEvaluator({}, ({value}: {value: number}) =>
            number.create(value).augment(formatAugmentation, octal)
        ),
    ],
});
