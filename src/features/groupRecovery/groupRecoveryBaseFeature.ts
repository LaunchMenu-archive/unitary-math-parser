import {createBaseFeature} from "../../createBaseFeature";
import {IASTExpression} from "../../_types/AST/IASTExpression";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {leftBracketToken, rightBracketToken} from "../groupBaseFeature";
import {leftBracketRecoveryToken} from "./groupRecoveryFeature";

export const groupRecoveryBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, IASTExpression, ICSTLeaf];
    AST: IASTExpression;
    name: "recoveryGroup";
}>({
    name: "recoveryGroup",
    parse: {
        tokens: [leftBracketToken, rightBracketToken],
        exec({parser, createLeaf, createNode}) {
            return parser.or(0, [
                {
                    ALT: () => {
                        const {addChild, finish} = createNode();
                        addChild({
                            ...createLeaf(parser.consume(0, leftBracketRecoveryToken)),
                            isRecovery: true,
                        });
                        addChild(parser.subrule(0, parser.expression));
                        addChild(createLeaf(parser.consume(1, rightBracketToken)));
                        return finish();
                    },
                },
                {
                    ALT: () => {
                        const {addChild, finish} = createNode();
                        addChild(createLeaf(parser.consume(2, leftBracketToken)));
                        addChild(parser.subrule(1, parser.expression));
                        const token = parser.option(0, () =>
                            parser.consume(3, rightBracketToken)
                        );
                        if (token) {
                            addChild(createLeaf(token));
                        } else {
                            const lastToken = parser.LA(0);
                            const pos = lastToken.image.length + lastToken.startOffset;
                            addChild({
                                type: rightBracketToken,
                                range: {start: pos, end: pos},
                                text: ")",
                                isRecovery: true,
                            });
                        }
                        return finish();
                    },
                },
            ]);
        },
    },
    abstract({children: [l, exp, r]}, source) {
        return exp;
    },
});
