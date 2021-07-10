import {addFeature} from "./features/addFeature";
import {groupRecoveryFeature} from "./features/groupRecovery/groupRecoveryFeature";
import {functionBaseFeature} from "./features/functionBaseFeature";
import {multiplyFeature} from "./features/multiplyFeature";
import {numberBaseFeature} from "./features/numberBaseFeature";
import {prefixFeature} from "./features/prefixTestFeature";
import {Parser} from "./Parser";
import {groupRecoveryBaseFeature} from "./features/groupRecovery/groupRecoveryBaseFeature";
import {ICST} from "./_types/CST/ICST";
import {obtainAllPossibleGroupOptions} from "./features/groupRecovery/obtainAllPossibleGroupOptions";
import {groupBaseFeature} from "./features/groupBaseFeature";
import {createToken} from "chevrotain";
import {ICSTLeaf} from "./_types/CST/ICSTLeaf";
import {createFeature} from "./createFeature";
import {createBaseFeature} from "./createBaseFeature";
import {TGetASTBaseBody} from "./_types/AST/TGetASTBaseBody";
import {ICSTNode} from "./_types/CST/ICSTNode";

// const parser = new Parser({
//     features: [groupRecoveryFeature, prefixFeature, addFeature, multiplyFeature],
//     baseFeatures: [numberBaseFeature, functionBaseFeature, groupRecoveryBaseFeature],
// });
// const input = "$5*5))+((max(4,3*2)";
// const result = parser.parse(input);
// if ("errors" in result) {
//     console.log(...result.errors.map(({multilineMessage}) => multilineMessage));
// } else {
//     console.time();
//     const res = result.ast.reduce<number>(node => {
//         if (node.type == "number") {
//             return node.value;
//         } else if (node.type == "add") {
//             return node.first + node.second;
//         } else if (node.type == "multiply") {
//             return node.factor1 * node.factor2;
//         } else if (node.type == "prefix") {
//             return node.val + 10;
//         } else if (node.type == "function") {
//             if (node.func == "max") return Math.max(...node.args);
//         }
//         return 0;
//     });
//     console.timeEnd();
//     console.log(res);

//     const tree = result.ast.tree;
//     if (tree.type == "function") {
//         const arg = tree.args[0];
//         if (arg.type == "multiply") console.log(arg.factor1);
//     }
//     if (tree.type == "multiply") {
//         const f1 = tree.factor1;
//         if (f1.type == "number") {
//         }
//     }

//     let i = 0;
//     console.log(`"${input}" could have been:`);
//     console.time();
//     for (let tree of obtainAllPossibleGroupOptions(result.cst.tree)) {
//         console.log(toString(tree));
//     }
//     console.timeEnd();
// }

// const result2 = parse("$4+max(4*2)+5").parse();
// console.log(result2);

function toString(tree: ICST, debug: boolean = false): string {
    if ("text" in tree) return tree.text;
    const children = tree.children.map(child => toString(child, debug)).join("");
    return debug ? `[${children}]` : children;
}

const varToken = createToken({name: "VAR", pattern: /\w+/, label: "var"});
const varFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {var: string};
    name: "var";
}>({
    name: "var",
    parse: {
        tokens: [varToken],
        exec({parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, varToken)));
            return finish();
        },
    },
    abstract: ({children: [child]}) => ({
        var: child.text,
    }),
    recurse: node => node,
});

const parserDif = new Parser({
    features: [addFeature, multiplyFeature],
    baseFeatures: [numberBaseFeature, groupBaseFeature, varFeature],
});
const inputDif = "(x+3*6)*x+14*y*x*(x+9)";
const resultDif = parserDif.parse(inputDif);
if (!("errors" in resultDif)) {
    type IMathNode = typeof resultDif.ast.tree;
    const createNode = (
        type: IMathNode["type"],
        body: TGetASTBaseBody<IMathNode>,
        source: ICST
    ): IMathNode => ({source, type, ...body} as any);
    const target = "x";
    const derivative = resultDif.ast.reduce<{dif: IMathNode; or: IMathNode}>(
        ({source, ...node}) => {
            if (node.type == "number") {
                return {
                    dif: createNode("number", {value: 0}, source),
                    or: {...node, source},
                };
            } else if (node.type == "var") {
                return {
                    dif: createNode(
                        "number",
                        {value: node.var == target ? 1 : 0},
                        source
                    ),
                    or: {...node, source},
                };
            } else if (node.type == "add") {
                return {
                    dif: createNode(
                        "add",
                        {first: node.first.dif, second: node.second.dif},
                        source
                    ),
                    or: createNode(
                        "add",
                        {first: node.first.or, second: node.second.or},
                        source
                    ),
                };
            } else {
                // if (node.type == "multiply") {
                return {
                    dif: createNode(
                        "add",
                        {
                            first: createNode(
                                "multiply",
                                {factor1: node.factor1.or, factor2: node.factor2.dif},
                                source
                            ),
                            second: createNode(
                                "multiply",
                                {factor1: node.factor1.dif, factor2: node.factor2.or},
                                source
                            ),
                        },
                        source
                    ),
                    or: createNode(
                        "multiply",
                        {factor1: node.factor1.or, factor2: node.factor2.or},
                        source
                    ),
                };
            }
        }
    ).dif;
    const simplified = parserDif.reduceAST<IMathNode>(({source, ...node}) => {
        if (node.type == "multiply") {
            if (node.factor1.type == "number") {
                //  0*exp = 0
                if (node.factor1.value == 0)
                    return createNode("number", {value: 0}, source);
                // 1*exp = exp
                if (node.factor1.value == 1) return node.factor2;

                // [num]*[num] = [num*num]
                if (node.factor2.type == "number")
                    return createNode(
                        "number",
                        {value: node.factor1.value * node.factor2.value},
                        source
                    );
            }
            if (node.factor2.type == "number") {
                // exp*0 = 0
                if (node.factor2.value == 0)
                    return createNode("number", {value: 0}, source);
                // exp*1 = exp
                if (node.factor2.value == 1) return node.factor1;
            }
        }
        if (node.type == "add") {
            if (node.first.type == "number") {
                // 0+exp = exp
                if (node.first.value == 0) return node.second;
                // [num]+[num] = [num+num]
                if (node.second.type == "number")
                    return createNode(
                        "number",
                        {value: node.first.value + node.second.value},
                        source
                    );
            }
            // exp+0 = exp
            if (node.second.type == "number" && node.second.value == 0) return node.first;

            // All variants of ([num]*x)+x = (([num+1])*x)
            for (let [t1, t2] of [
                [node.first, node.second],
                [node.second, node.first],
            ]) {
                if (!(t1.type == "var" && t2.type == "multiply")) continue;
                for (let [f1, f2] of [
                    [t2.factor1, t2.factor2],
                    [t2.factor2, t2.factor1],
                ]) {
                    if (!(f1.type == "number" && f2.type == "var" && f2.var == t1.var))
                        continue;
                    return createNode(
                        "multiply",
                        {
                            factor1: createNode("number", {value: f1.value + 1}, source),
                            factor2: createNode("var", {var: t1.var}, t1.source),
                        },
                        source
                    );
                }
            }

            // All variants of (x+exp)+x = (2x+exp)
            for (let [t1, t2] of [
                [node.first, node.second],
                [node.second, node.first],
            ]) {
                if (!(t1.type == "var" && t2.type == "add")) continue;
                for (let [ti1, ti2] of [
                    [t2.first, t2.second],
                    [t2.first, t2.second],
                ]) {
                    if (!(ti1.type == "var" && ti1.var == t1.var)) continue;
                    return createNode(
                        "add",
                        {
                            first: createNode(
                                "multiply",
                                {
                                    factor1: createNode("number", {value: 2}, source),
                                    factor2: createNode(
                                        "var",
                                        {var: ti1.var},
                                        ti1.source
                                    ),
                                },
                                source
                            ),
                            second: ti2,
                        },
                        source
                    );
                }
            }

            if (
                node.first.type == "var" &&
                node.second.type == "var" &&
                node.first.var == node.second.var
            )
                return createNode(
                    "multiply",
                    {
                        factor1: createNode("number", {value: 2}, source),
                        factor2: createNode(
                            "var",
                            {var: node.first.var},
                            node.first.source
                        ),
                    },
                    source
                );
        }

        return {source, ...node};
    }, derivative);

    const print = (node: IMathNode) =>
        parserDif.reduceAST<string>(node => {
            if (node.type == "var") return node.var;
            if (node.type == "number") return node.value + "";
            if (node.type == "add") return `(${node.first}+${node.second})`;
            if (node.type == "multiply") return `(${node.factor1}*${node.factor2})`;
            return "";
        }, node);
    const printed = print(simplified);
    const printedOr = print(derivative);

    console.log(`derivative of ${inputDif}\n= ${printedOr}\n= ${printed}`);
}
