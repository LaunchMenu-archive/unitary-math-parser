import {createToken} from "chevrotain";
import {createBaseFeature} from "../../createBaseFeature";
import {createEvaluator} from "../../createEvaluator";
import {createFeatureSupport} from "../../createFeatureSupport";
import {EvaluationContext} from "../../parser/AST/EvaluationContext";
import {IASTBase} from "../../_types/AST/IASTBase";
import {IASTExpression} from "../../_types/AST/IASTExpression";
import {IRecursive, IRP} from "../../_types/AST/IRecursive";
import {TGetASTType} from "../../_types/AST/TGetASTType";
import {ICSTLeaf} from "../../_types/CST/ICSTLeaf";
import {ICSTNode} from "../../_types/CST/ICSTNode";
import {leftBracketToken, rightBracketToken} from "../groupBaseFeature";
import {textToken} from "../variables/varBaseFeature";
import {functionContextIdentifier} from "./functionContextIdentifier";

export const parameterSeparatorToken = createToken({
    name: "PARAMETER-SEPARATOR",
    pattern: /\,/,
    label: ",",
});
export const argumentsSupport = createFeatureSupport<{
    CST: (IASTExpression | ICSTLeaf)[];
    AST: {args: IRP<Array<IRecursive<IASTExpression>>>};
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
    evaluate: [],
});

export const functionBaseFeature = createBaseFeature<{
    name: "function";
    CST: [ICSTLeaf, ICSTLeaf, TGetASTType<typeof argumentsSupport>, ICSTLeaf];
    AST: {
        func: string;
        args: IRP<Array<IRecursive<IASTExpression>>>;
    };
    supports: [typeof argumentsSupport];
}>({
    name: "function",
    parse: {
        tokens: [textToken, leftBracketToken, rightBracketToken],
        supports: [argumentsSupport],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, textToken)));
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
    evaluate: [
        createEvaluator(
            {args: []},
            (
                {func, args, source}: {func: string; args: any[]} & IASTBase,
                context: EvaluationContext
            ) => {
                const funcContext = context.get(functionContextIdentifier);
                return funcContext.exec(
                    func,
                    args,
                    {
                        name: source.children[0],
                        allArgs: source.children[2],
                        args: (source.children[2] as ICSTNode).children.reduce(
                            (args, child, i) => (i % 2 == 0 ? [...args, child] : args),
                            [] as ICSTNode[]
                        ),
                    },
                    context
                );
            }
        ),
    ],
});
