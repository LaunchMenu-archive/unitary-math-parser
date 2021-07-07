import {createToken} from "chevrotain";
import {createBaseFeature} from "../createBaseFeature";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {spaceToken} from "./util/optionalSpace";

export const numberToken = createToken({
    name: "NUMBER",
    pattern: /(\d*\.)?\d+/,
    label: "number",
});
export const numberBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: number};
    name: "number";
}>({
    name: "number",
    parse: {
        tokens: [numberToken, spaceToken],
        exec({createNode, createLeaf, parser}) {
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
