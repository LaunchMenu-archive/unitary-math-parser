import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTBase} from "../_types/AST/IASTBase";
import {ICSTNode} from "../_types/CST/ICSTNode";
import {IEvaluationErrorObject} from "../_types/evaluation/IEvaluationErrorObject";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {addFeature} from "./addFeature";
import {checkDimensionMatch} from "./util/number/checkDimensionMatch";
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

export const subtractToken = createToken({name: "SUBTRACT", pattern: /\-/, label: '"-"'});
export const subtractFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "subtract";
}>({
    name: "subtract",
    parse: {
        tokens: [subtractToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, subtractToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: [addFeature]},
    },
    abstract: ({children: [left, op, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {left: isNumber, right: isNumber},
            (
                {
                    left,
                    right,
                    source,
                }: {
                    left: IUnitaryNumber;
                    right: IUnitaryNumber;
                } & IASTBase,
                context
            ): IUnitaryNumber | IEvaluationErrorObject => {
                const error = checkDimensionMatch(
                    left.unit,
                    right.unit,
                    context,
                    source.children[2] as ICSTNode
                );
                if (error) return error;

                return createNumber(
                    left.value - left.unit.convert(right)!.value,
                    left.unit,
                    left.isUnit && right.isUnit
                );
            }
        ),
    ],
});
