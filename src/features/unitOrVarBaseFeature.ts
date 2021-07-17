import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createEvaluator} from "../createEvaluator";
import {createEvaluationError} from "../parser/AST/createEvaluationError";
import {createEvaluationErrorObject} from "../parser/AST/createEvaluationErrorsObject";
import {getSyntaxPointerMessage} from "../parser/getSyntaxPointerMessage";
import {IASTBase} from "../_types/AST/IASTBase";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IEvaluationError} from "../_types/evaluation/IEvaluationError";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {createNumber} from "./util/number/createNumber";
import {Unit} from "./util/number/Unit";
import {unitContextIdentifier} from "./util/number/unitContextIdentifier";
import {spaceToken} from "./util/spaceToken";

export const textToken = createToken({
    name: "TEXT",
    pattern: /\w+/,
    label: "text",
});
export const unitOrVarBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, ICSTLeaf];
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
                {text, source}: {text: string} & IASTBase,
                context
            ): IUnitaryNumber | IEvaluationErrorObject => {
                // TODO: add variable support
                const unit = context.get(unitContextIdentifier).get(text);
                if (!unit)
                    return createEvaluationError(
                        {
                            type: "unknown unit",
                            message: i => `unknown unit found at index ${i}: "${text}"`,
                            multilineMessage: pm =>
                                `unknown unit "${text}" found:\n${pm}`,
                            source,
                        },
                        context
                    );
                return createNumber(1, new Unit([{unit, label: text}], []), true);
            }
        ),
    ],
});
