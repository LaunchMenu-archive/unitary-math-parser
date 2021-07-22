import {createBaseFeature} from "../createBaseFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {leftBracketToken, rightBracketToken} from "./tokens";

/**
 * The feature to increase precedence by enclosing an expression by brackets ()
 */
export const groupBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, IASTExpression, ICSTLeaf];
    AST: IASTExpression;
    name: "group";
}>({
    name: "group",
    parse: {
        tokens: [leftBracketToken, rightBracketToken],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, leftBracketToken)));
            addChild(parser.subrule(0, parser.expression));
            addChild(createLeaf(parser.consume(0, rightBracketToken)));
            return finish();
        },
    },
    abstract: ({children: [l, exp, r]}) => exp,
});
