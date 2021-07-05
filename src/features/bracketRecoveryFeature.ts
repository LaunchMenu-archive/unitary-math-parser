import {createToken, createTokenInstance} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createFeature} from "../createFeature";
import {createCSTDataIdentifier} from "../parser/CST/createCSTDataIdentifier";
import {IASTRecursive} from "../_types/AST/IASTRecursive";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {addFeature} from "./addFeature";
import {leftBracketToken, rightBracketToken} from "./groupBaseFeature";

export const leftBracketRecoveryToken = createToken({name: "LEFT-BRACKET-RECOVERY"});
const createRecoveryToken = (i: number) =>
    createTokenInstance(leftBracketRecoveryToken, "(", i, i, i, i, i, i);

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
                // If we're at the top level, not in a recursion, try adding `(` brackets as long as we finish on a `)` bracket
                rd.topLevel = false;

                // While the next token after parsing failed is `)` add a recovery `(` to the start
                for (let recoveryCount = 0; ; recoveryCount++) {
                    const result = parser.tryRule(nextRule, {
                        transformTokens: (tokens, i) => {
                            if (recoveryCount == 0) return tokens;

                            const tok = createRecoveryToken(i);
                            return [
                                ...tokens.slice(0, i + 1),
                                ...new Array(recoveryCount).fill(tok),
                                ...tokens.slice(i + 1),
                            ];
                        },
                    });

                    // If the next token is not a closing bracket, we don't need to add an opening bracket anymore
                    if (parser.LA(1).tokenType != rightBracketToken)
                        return result.result as any;

                    // Revert the previous attempt
                    result.revert();
                    if (!result.result) break; // If parsing so far failed, adding more brackets won't fix it
                }

                rd.topLevel = true;
            }

            // If everything failed, return the parsed result as normal
            return parser.subrule(0, nextRule);
        },
    },
    abstract(child) {
        return child;
    },
});
