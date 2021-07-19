import {createToken} from "chevrotain";
import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {createEvaluationError} from "../../parser/AST/createEvaluationError";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {IASTBase} from "../../_types/AST/IASTBase";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../../_types/evaluation/number/IUnitaryNumber";
import {createDimension} from "../util/number/createDimension";
import {createNumber} from "../util/number/createNumber";
import {Unit} from "../util/number/Unit";
import {unitContextIdentifier} from "../util/number/unitContextIdentifier";
import {unitConfigContextIdentifier} from "./unitConfigContextIdentifier";
import {textToken} from "./varBaseFeature";

export const getUnitEvalFunc = (
    {text, source}: {text: string} & IASTBase,
    context: EvaluationContext
): IUnitaryNumber | IEvaluationErrorObject => {
    const unitConfig = context.get(unitConfigContextIdentifier);

    const unitContext = context.get(unitContextIdentifier);
    let unit = unitContext.get(text);
    if (!unit) {
        if (!unitConfig.customUnits)
            return createEvaluationError(
                {
                    type: "unknownUnit",
                    message: i => `Unknown unit found at index ${i}: "${text}"`,
                    multilineMessage: pm => `Unknown unit "${text}" found:\n${pm}`,
                    source,
                },
                context
            );

        const [customDimension, customUnit] = createDimension({
            name: text,
            priority: 1e3,
            unit: {
                name: text,
            },
        });
        unit = customUnit;
        context.update(unitContextIdentifier, unitContext.augment(unit));
    }

    return createNumber(1, new Unit([{unit, label: text}], []), true);
};

export const unitToken = createToken({
    name: "UNIT",
    pattern: /#/,
    label: '"#"',
});

/**
 * A feature to read units
 */
export const unitBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, ICSTLeaf];
    AST: {text: string};
    name: "unit";
}>({
    name: "unit",
    parse: {
        tokens: [unitToken, textToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, unitToken)));
            addChild(createLeaf(parser.consume(2, textToken)));
            return finish();
        },
    },
    abstract: ({children: [l, child]}) => ({text: child.text}),
    recurse: node => node,
    evaluate: [createEvaluator({}, getUnitEvalFunc)],
});
