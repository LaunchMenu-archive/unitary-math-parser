import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {createEvaluationError} from "../../parser/AST/createEvaluationError";
import {IASTBase} from "../../_types/AST/IASTBase";
import {IASTExpression} from "../../_types/AST/IASTExpression";
import {IRecursive} from "../../_types/AST/IRecursive";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {
    dotToken,
    formatToken,
    numberFormatToken,
    numberToken,
    textToken,
} from "../tokens";
import {formatAugmentation} from "../util/formats/formatAugmentation";
import {valueFormat} from "../util/formats/valueFormat";
import {IFormat} from "../util/formats/_types/IFormat";
import {number} from "../util/number/number";

/**
 * The feature to take care of reading numbers with support for different formats
 */
export const formattedNumberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {value: string; format: IRecursive<IASTExpression>};
    name: "formatted-number";
}>({
    name: "formatted-number",
    parse: {
        tokens: [numberFormatToken, numberToken, textToken, formatToken],
        exec({createNode, createLeaf, parser, nextRule}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(3, numberFormatToken)));
            addChild(parser.subrule(0, nextRule));
            return finish();
        },
    },
    abstract: ({children: [value, format]}) => ({
        value: value.text.substring(0, value.text.length - 3),
        format: format,
    }),
    recurse: ({format, ...rest}, recurse) => ({format: recurse(format), ...rest}),
    evaluate: [
        createEvaluator(
            {format: valueFormat},
            (
                {value, format, source}: {value: string; format: IFormat} & IASTBase,
                context
            ) => {
                const result = format.data.decode(value);
                if ("value" in result)
                    return number
                        .create(result.value)
                        .augment(formatAugmentation, format.data);
                return createEvaluationError(
                    {
                        type: "unexpectedNumberToken",
                        message: index =>
                            `Unexpected character found for ${format.data.name} at index ${index}: "${result.unexpectedChar}"`,
                        multilineMessage: pt =>
                            `Unexpected character found for ${format.data.name}:\n${pt}`,
                        range: {start: result.index + source.children[0].range.start},
                        extra: {index: result.index},
                        source,
                    },
                    context
                );
            }
        ),
    ],
});
