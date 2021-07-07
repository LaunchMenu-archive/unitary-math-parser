import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createFeatureSupport} from "../createFeatureSupport";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {TGetASTType} from "../_types/AST/TGetASTType";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {leftBracketToken, rightBracketToken} from "./groupBaseFeature";

export const parameterSeparatorToken = createToken({
    name: "PARAMETER-SEPARATOR",
    pattern: /\,/,
    label: ",",
});
export const argumentsSupport = createFeatureSupport<{
    CST: (IASTExpression | ICSTLeaf)[];
    AST: {args: IASTExpression[]};
    name: "args";
}>({
    name: "args",
    parse: {
        tokens: [parameterSeparatorToken],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            parser.option(1, () => {
                addChild(parser.subrule(1, parser.expression));
                parser.many(1, () => {
                    addChild(createLeaf(parser.consume(0, parameterSeparatorToken)));
                    addChild(parser.subrule(2, parser.expression));
                });
            });
            return finish();
        },
    },
    abstract({children}, source) {
        return {
            args: children.reduce(
                (children, child, i) =>
                    i % 2 == 0 ? [...children, child as IASTExpression] : children,
                []
            ),
            source,
        };
    },
});

export const functionNameToken = createToken({
    name: "FUNCTION-NAME",
    pattern: /[a-zA-Z_]\w+/,
    label: "function-name",
});
export const functionBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf, ICSTLeaf, TGetASTType<typeof argumentsSupport>, ICSTLeaf];
    AST: {func: string; args: IASTExpression[]};
    name: "function";
}>({
    name: "function",
    parse: {
        tokens: [functionNameToken, leftBracketToken, rightBracketToken],
        supports: [argumentsSupport],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, functionNameToken)));
            addChild(createLeaf(parser.consume(2, leftBracketToken)));
            addChild(parser.supportRule(0, argumentsSupport));
            addChild(createLeaf(parser.consume(3, rightBracketToken)));
            return finish();
        },
    },
    abstract({children: [name, lb, args, rb]}, source) {
        return {
            func: name.text,
            args: args.args,
            source,
        };
    },
});
