import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {isError} from "../../parser/isError";
import {IASTBase} from "../../_types/AST/IASTBase";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {textToken} from "../tokens";
import {INumber} from "../util/number/_types/INumber";
import {getUnitEvalFunc} from "./unitBaseFeature";
import {getVariableEvalFunc} from "./varBaseFeature";

/**
 * A feature to read variables or units
 */
export const unitOrVarBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {text: string};
    name: "unit/var";
}>({
    name: "unit/var",
    parse: {
        tokens: [textToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, textToken)));
            return finish();
        },
    },
    abstract: ({children: [child]}) => ({text: child.text}),
    recurse: node => node,
    evaluate: [
        createEvaluator(
            {},
            (
                node: {text: string} & IASTBase,
                context
            ): INumber | IEvaluationErrorObject => {
                const variable = getVariableEvalFunc(node, context);
                if (isError(variable)) {
                    const unit = getUnitEvalFunc(node, context);
                    if (!isError(unit)) return unit;
                }
                return variable;
            }
        ),
    ],
});
