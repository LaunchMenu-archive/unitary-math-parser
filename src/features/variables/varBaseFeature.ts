import {createToken} from "chevrotain";
import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {createEvaluationError} from "../../parser/AST/createEvaluationError";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {IASTBase} from "../../_types/AST/IASTBase";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../../_types/evaluation/number/IUnitaryNumber";
import {INumber} from "../util/number/_types/INumber";
import {variableContextIdentifier} from "./variableContextIdentifier";

export const getVariableEvalFunc = (
    {text, source}: {text: string} & IASTBase,
    context: EvaluationContext
): INumber | IEvaluationErrorObject => {
    const variables = context.get(variableContextIdentifier);
    const foundVariable = variables.get(text);
    if (foundVariable) return foundVariable;

    return createEvaluationError(
        {
            type: "unknownVariable",
            message: i => `Unknown variable found at index ${i}: "${text}"`,
            multilineMessage: pm => `Unknown variable "${text}" found:\n${pm}`,
            source,
        },
        context
    );
};

export const textToken = createToken({
    name: "TEXT",
    pattern: /(\w|%)+/,
    label: "text",
});
export const variableToken = createToken({
    name: "VAR",
    pattern: /\$/,
    label: '"$"',
});

/**
 * A feature to read variables
 */
export const varBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, ICSTLeaf];
    AST: {text: string};
    name: "var";
}>({
    name: "var",
    parse: {
        tokens: [variableToken, textToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, variableToken)));
            addChild(createLeaf(parser.consume(2, textToken)));
            return finish();
        },
    },
    abstract: ({children: [l, child]}) => ({text: child.text}),
    recurse: node => node,
    evaluate: [createEvaluator({}, getVariableEvalFunc)],
});
