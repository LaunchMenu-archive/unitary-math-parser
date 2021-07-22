import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTBase} from "../_types/AST/IASTBase";
import {multiplyFeature} from "./multiplyFeature";
import {moduloToken, spaceToken} from "./tokens";
import {number} from "./util/number/number";
import {INumber} from "./util/number/_types/INumber";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";

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
            {left: number, right: number},
            (
                node: {
                    left: INumber;
                    right: INumber;
                } & IASTBase
            ): INumber =>
                number.create(
                    ((node.left.data % node.right.data) + node.right.data) %
                        node.right.data,
                    {
                        node,
                        values: [node.left, node.right],
                    }
                )
        ),
    ],
});
