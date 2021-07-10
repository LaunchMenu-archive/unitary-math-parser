import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createFeatureSupport} from "../createFeatureSupport";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IRecursive} from "../_types/AST/IRecursive";
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
    AST: {args: IRecursive<IASTExpression>[]};
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
    abstract: ({children}) => ({
        args: children.reduce(
            (children, child, i) =>
                i % 2 == 0 ? [...children, child as IASTExpression] : children,
            []
        ),
    }),
    recurse: ({args, ...rest}, recurse) => ({args: args.map(recurse), ...rest}),
});

export const functionNameToken = createToken({
    name: "FUNCTION-NAME",
    pattern: /[a-zA-Z_]\w+/,
    label: "function-name",
});
export const functionBaseFeature = createBaseFeature<{
    name: "function";
    CST: [ICSTLeaf, ICSTLeaf, TGetASTType<typeof argumentsSupport>, ICSTLeaf];
    AST: {
        func: string;
        args: IRecursive<IASTExpression>[];
    };
    supports: [typeof argumentsSupport];
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
    abstract: ({children: [name, lb, args, rb]}, source) => ({
        func: name.text,
        args: args.args,
        source,
    }),
    recurse: ({args, ...rest}, recurse) => ({
        args: args.map(recurse),
        ...rest,
    }),
});
