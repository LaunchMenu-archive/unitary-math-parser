import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {addFeature} from "../features/addFeature";
import {groupBaseFeature} from "../features/groupBaseFeature";
import {multiplyFeature} from "../features/multiplyFeature";
import {numberBaseFeature} from "../features/numberBaseFeature";
import {Parser} from "../Parser";
import {TGetASTBaseBody} from "../_types/AST/TGetASTBaseBody";
import {ICST} from "../_types/CST/ICST";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";

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

/** This function will never get executed, but it serves as a test to check whether all intellisense continues working */
function reduceASTTypetest() {
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
                if (node.second.type == "number" && node.second.value == 0)
                    return node.first;

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
                        if (
                            !(f1.type == "number" && f2.type == "var" && f2.var == t1.var)
                        )
                            continue;
                        return createNode(
                            "multiply",
                            {
                                factor1: createNode(
                                    "number",
                                    {value: f1.value + 1},
                                    source
                                ),
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
}
