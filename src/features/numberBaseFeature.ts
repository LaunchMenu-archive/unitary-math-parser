import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {createEvaluator} from "../createEvaluator";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {createNumber} from "./util/number/createNumber";
import {Unit} from "./util/number/Unit";

export const numberToken = createToken({
    name: "NUMBER",
    pattern: /(\d*\.)?\d+/,
    label: "number",
});
export const numberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: IUnitaryNumber};
    name: "number";
}>({
    name: "number",
    parse: {
        tokens: [numberToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(0, numberToken)));
            return finish();
        },
    },
    abstract: ({children: [child]}) => ({
        value: createNumber(parseFloat(child.text), new Unit([], [])),
    }),
    recurse: node => node,
    evaluate: [createEvaluator({}, ({value}: {value: IUnitaryNumber}) => value)],
});
