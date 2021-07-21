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
    abstract: ({children: [child]}) => ({var: child.text}),
    recurse: node => node,
    evaluate: [],
});

/** This function will never get executed, but it serves as a test to check whether all intellisense continues working */
function reduceASTTypeTest() {
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
                            {left: node.left.dif, right: node.right.dif},
                            source
                        ),
                        or: createNode(
                            "add",
                            {left: node.left.or, right: node.right.or},
                            source
                        ),
                    };
                } else {
                    // if (node.type == "multiply") {
                    return {
                        dif: createNode(
                            "add",
                            {
                                left: createNode(
                                    "multiply",
                                    {left: node.left.or, right: node.right.dif},
                                    source
                                ),
                                right: createNode(
                                    "multiply",
                                    {left: node.left.dif, right: node.right.or},
                                    source
                                ),
                            },
                            source
                        ),
                        or: createNode(
                            "multiply",
                            {left: node.left.or, right: node.right.or},
                            source
                        ),
                    };
                }
            }
        ).dif;
        const simplified = parserDif.reduceAST<IMathNode>(({source, ...node}) => {
            if (node.type == "multiply") {
                if (node.left.type == "number") {
                    //  0*exp = 0
                    if (node.left.value == 0)
                        return createNode("number", {value: 0}, source);
                    // 1*exp = exp
                    if (node.left.value == 1) return node.right;

                    // [num]*[num] = [num*num]
                    if (node.right.type == "number")
                        return createNode(
                            "number",
                            {value: node.left.value * node.right.value},
                            source
                        );
                }
                if (node.right.type == "number") {
                    // exp*0 = 0
                    if (node.right.value == 0)
                        return createNode("number", {value: 0}, source);
                    // exp*1 = exp
                    if (node.right.value == 1) return node.left;
                }
            }
            if (node.type == "add") {
                if (node.left.type == "number") {
                    // 0+exp = exp
                    if (node.left.value == 0) return node.right;
                    // [num]+[num] = [num+num]
                    if (node.right.type == "number")
                        return createNode(
                            "number",
                            {value: node.left.value + node.right.value},
                            source
                        );
                }
                // exp+0 = exp
                if (node.right.type == "number" && node.right.value == 0)
                    return node.left;

                // All variants of ([num]*x)+x = (([num+1])*x)
                for (let [t1, t2] of [
                    [node.left, node.right],
                    [node.right, node.left],
                ]) {
                    if (!(t1.type == "var" && t2.type == "multiply")) continue;
                    for (let [f1, f2] of [
                        [t2.left, t2.right],
                        [t2.right, t2.left],
                    ]) {
                        if (
                            !(f1.type == "number" && f2.type == "var" && f2.var == t1.var)
                        )
                            continue;
                        return createNode(
                            "multiply",
                            {
                                left: createNode("number", {value: f1.value + 1}, source),
                                right: createNode("var", {var: t1.var}, t1.source),
                            },
                            source
                        );
                    }
                }

                // All variants of (x+exp)+x = (2x+exp)
                for (let [t1, t2] of [
                    [node.left, node.right],
                    [node.right, node.left],
                ]) {
                    if (!(t1.type == "var" && t2.type == "add")) continue;
                    for (let [ti1, ti2] of [
                        [t2.left, t2.right],
                        [t2.left, t2.right],
                    ]) {
                        if (!(ti1.type == "var" && ti1.var == t1.var)) continue;
                        return createNode(
                            "add",
                            {
                                left: createNode(
                                    "multiply",
                                    {
                                        left: createNode("number", {value: 2}, source),
                                        right: createNode(
                                            "var",
                                            {var: ti1.var},
                                            ti1.source
                                        ),
                                    },
                                    source
                                ),
                                right: ti2,
                            },
                            source
                        );
                    }
                }

                if (
                    node.left.type == "var" &&
                    node.right.type == "var" &&
                    node.left.var == node.right.var
                )
                    return createNode(
                        "multiply",
                        {
                            left: createNode("number", {value: 2}, source),
                            right: createNode(
                                "var",
                                {var: node.left.var},
                                node.left.source
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
                if (node.type == "add") return `(${node.left}+${node.right})`;
                if (node.type == "multiply") return `(${node.left}*${node.right})`;
                return "";
            }, node);
        const printed = print(simplified);
        const printedOr = print(derivative);

        console.log(`derivative of ${inputDif}\n= ${printedOr}\n= ${printed}`);
    }
}
