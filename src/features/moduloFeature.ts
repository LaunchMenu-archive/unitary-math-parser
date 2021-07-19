import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {multiplyFeature} from "./multiplyFeature";
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";
import {textToken} from "./variables/varBaseFeature";

export const moduloToken = createToken({
    name: "MOD",
    pattern: /mod/,
    label: "mod",
    longer_alt: textToken,
});

/**
 * The feature to take care of module when encountering `mod`
 */
export const moduloFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "mod";
}>({
    name: "mod",
    parse: {
        tokens: [moduloToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, moduloToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: [multiplyFeature]},
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
            ({
                left,
                right,
            }: {
                left: IUnitaryNumber;
                right: IUnitaryNumber;
            }): IUnitaryNumber =>
                createNumber(
                    ((left.value % right.value) + right.value) % right.value,
                    left.unit,
                    left.isUnit
                )
        ),
    ],
});
