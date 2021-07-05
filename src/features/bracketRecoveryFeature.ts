import {createToken, createTokenInstance} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createFeature} from "../createFeature";
import {createCSTDataIdentifier} from "../parser/CST/createCSTDataIdentifier";
import {IASTRecursive} from "../_types/AST/IASTRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {addFeature} from "./addFeature";
import {leftBracketToken, rightBracketToken} from "./groupBaseFeature";

export const leftBracketRecoveryToken = createToken({name: "LEFT-BRACKET-RECOVERY"});

export const groupRecoveryBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, IASTRecursive, ICSTLeaf];
    AST: IASTRecursive;
    name: "recoveryGroup";
}>({
    name: "recoveryGroup",
    parse: {
        tokens: [leftBracketToken, rightBracketToken],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, leftBracketRecoveryToken)));
            addChild(parser.subrule(0, parser.expression));
            addChild(createLeaf(parser.consume(0, rightBracketToken)));
            return finish();
        },
    },
    abstract({children: [l, exp, r]}, source) {
        return exp;
    },
});

const recoveryData = createCSTDataIdentifier(() => ({topLevel: false}));
export const groupRecoveryFeature = createFeature<{
    CST: undefined;
    AST: IASTRecursive;
    name: "recoveryGroupInitiator";
}>({
    name: "recoveryGroupInitiator",
    parse: {
        tokens: [leftBracketToken, rightBracketToken],
        type: "prefixBase",
        init({parser, tokens}) {
            const rd = parser.getData(recoveryData);
            rd.topLevel = true; // Makes sure that no recovery is attempted during analysis, but is during actual parsing
        },
        precedence: {lowerThan: addFeature},
        exec({parser, nextRule}) {
            const rd = parser.getData(recoveryData);
            if (rd.topLevel) {
                try {
                    rd.topLevel = false;

                    // Try parsing the subtree as normal
                    const regularResult = parser.tryRule(nextRule);
                    if (
                        regularResult.result &&
                        parser.LA(1).tokenType != rightBracketToken
                    )
                        return regularResult.result;

                    // If this fails, revert the progress made so far
                    regularResult.revert();

                    // While the next token after parsing failed is `)` add a recovery `(` to the start
                    let recoveryCount = 0;
                    while (true) {
                        recoveryCount++;
                        const result = parser.tryRule(nextRule, {
                            transformTokens: (tokens, i) => {
                                const tok = createTokenInstance(
                                    leftBracketRecoveryToken,
                                    "(",
                                    i,
                                    i,
                                    i,
                                    i,
                                    i,
                                    i
                                );
                                return [
                                    ...tokens.slice(0, i + 1),
                                    ...new Array(recoveryCount).fill(tok),
                                    ...tokens.slice(i + 1),
                                ];
                            },
                        });

                        if (result.result && parser.LA(1).tokenType != rightBracketToken)
                            return result.result;

                        result.revert();
                        if (!result.result) break;
                    }
                } finally {
                    rd.topLevel = true;
                }
            }

            // If everything failed, return the parsed result as normal
            return parser.subrule(0, nextRule);
        },
    },
    abstract(child) {
        return child;
    },
});
