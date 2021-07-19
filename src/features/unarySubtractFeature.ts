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
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";

export const subtractToken = createToken({name: "SUBTRACT", pattern: /\-/, label: '"-"'});

/**
 * The feature to take care of unary subtraction when encountering `-`
 */
export const unarySubtractFeature = createFeature<{
    CST: [ICSTLeaf, IASTExpression];
    AST: {
        value: IRecursive<IASTExpression>;
    };
    name: "unary subtract";
}>({
    name: "unary subtract",
    parse: {
        tokens: [subtractToken, spaceToken],
        type: "prefix",
        exec({currentRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, subtractToken)));
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
            ({
                value: {value, unit, isUnit},
            }: {
                value: IUnitaryNumber;
            }): IUnitaryNumber | IEvaluationErrorObject =>
                createNumber(-value, unit, isUnit)
        ),
    ],
});
