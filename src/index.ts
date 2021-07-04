import {createToken} from "chevrotain";
import {createBaseFeature} from "./createBaseFeature";
import {createFeature} from "./createFeature";
import {createFeatureSupport} from "./createFeatureSupport";
import {createParser} from "./createParser";
import {createCSTLeaf} from "./parser/CST/createCSTLeaf";
import {createCSTNodeCreator} from "./parser/CST/createCSTNodeCreator";
import {
    addToken,
    functionNameToken,
    leftBracketToken,
    multiplyToken,
    numberToken,
    parameterSeparatorToken,
    rightBracketToken,
} from "./parser/CST/tokens";
import {IASTBase} from "./_types/AST/IASTBase";
import {IASTRecursive} from "./_types/AST/IASTRecursive";
import {TGetASTType} from "./_types/AST/TGetASTType";
import {ICSTLeaf} from "./_types/CST/ICSTLeaf";

// const {tokens} = Tokenizer.tokenize("(34) + 12 * (24 - 12) / 34");
// const parser = new Parser();
// parser.input = tokens;

// const result = parser.test();
// console.log(result);
// debugger;

const number = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: number};
    name: "number";
}>({
    name: "number",
    parse: {
        tokens: [numberToken],
        exec({nextRule, createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, numberToken)));
            return finish();
        },
    },
    abstract({children: [child]}, source) {
        return {
            value: parseFloat(child.text),
            source,
        };
    },
});

const args = createFeatureSupport<{
    CST: (IASTRecursive | ICSTLeaf)[];
    AST: {
        args: IASTRecursive[];
    };
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
                    i % 2 == 0 ? [...children, child as IASTRecursive] : children,
                []
            ),
            source,
        };
    },
});
const func = createBaseFeature<{
    CST: [ICSTLeaf, ICSTLeaf, TGetASTType<typeof args>, ICSTLeaf];
    AST: {func: string; args: IASTRecursive[]};
    name: "function";
}>({
    name: "function",
    parse: {
        tokens: [functionNameToken, leftBracketToken, rightBracketToken],
        supports: [args],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, functionNameToken)));
            addChild(createLeaf(parser.consume(2, leftBracketToken)));
            addChild(parser.supportRule(0, args));
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

const multiply = createFeature<{
    CST: [IASTRecursive, ICSTLeaf, IASTRecursive];
    AST: {factor1: IASTRecursive; factor2: IASTRecursive};
    name: "multiply";
}>({
    name: "multiply",
    parse: {
        tokens: [multiplyToken],
        type: "suffix",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, multiplyToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: number},
    },
    abstract({children: [factor1, op, factor2]}, source) {
        return {
            factor1,
            factor2,
            source,
        };
    },
});
const add = createFeature<{
    CST: [IASTRecursive, ICSTLeaf, IASTRecursive];
    AST: {first: IASTRecursive; second: IASTRecursive};
    name: "add";
}>({
    name: "add",
    parse: {
        tokens: [addToken],
        type: "suffix",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, addToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: multiply},
    },
    abstract({children: [first, op, second]}, source) {
        return {
            first,
            second,
            source,
        };
    },
});
const andToken = createToken({name: "And", pattern: /\&/});
const and = createFeature<{
    CST: [ICSTLeaf, IASTRecursive];
    AST: {thing: IASTRecursive};
    name: "and";
}>({
    name: "and",
    parse: {
        tokens: [andToken],
        type: "prefix",
        exec({currentRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, andToken)));
            addChild(parser.subrule(2, currentRule));
            return finish();
        },
        precedence: {sameAs: add},
    },
    abstract({children: [op, thing]}, source) {
        return {
            thing,
            source,
        };
    },
});
type s = TGetASTType<typeof and>;

const parse = createParser({
    features: [add, multiply, and],
    baseFeatures: [number, func],
});
const result = parse("&&&2*2+shit(2,5*3)");
const tree = result.parse();
if (tree.type == "function") {
    const arg = tree.args[0];
    if (arg.type == "multiply") console.log(arg.factor2);
}
if (tree.type == "and") {
    const v = tree.thing;
    if (v.type == "function") v.args;
}
debugger;
