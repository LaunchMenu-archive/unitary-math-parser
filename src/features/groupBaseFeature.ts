import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {IASTRecursive} from "../_types/AST/IASTRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";

export const leftBracketToken = createToken({name: "LEFT-BRACKET", pattern: /\(/});
export const rightBracketToken = createToken({name: "RIGHT-BRACKET", pattern: /\)/});

export const groupBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, IASTRecursive, ICSTLeaf];
    AST: IASTRecursive;
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
    abstract({children: [l, exp, r]}, source) {
        return exp;
    },
});
