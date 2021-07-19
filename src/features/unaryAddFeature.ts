import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {implicitMultiplyFeature} from "./implicitMultiplyFeature";
import {numberBaseFeature} from "./numberBaseFeature";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";

export const addToken = createToken({name: "ADD", pattern: /\+/, label: '"+"'});

/**
 * The feature to take care of unary subtraction when encountering `-`
 */
export const unaryAddFeature = createFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {
        value: IRecursive<IASTExpression>;
    };
    name: "unary addition";
}>({
    name: "unary addition",
    parse: {
        tokens: [addToken, spaceToken],
        type: "prefix",
        exec({currentRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, addToken)));
            addChild(parser.subrule(2, currentRule));
            return finish();
        },
        precedence: {lowerThan: [numberBaseFeature, implicitMultiplyFeature]},
    },
    abstract: ({children: [op, value]}) => ({value}),
    recurse: ({value, ...rest}, recurse) => ({
        value: recurse(value),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {value: isNumber},
            ({value}: {value: IUnitaryNumber}): IUnitaryNumber | IEvaluationErrorObject =>
                value
        ),
    ],
});
