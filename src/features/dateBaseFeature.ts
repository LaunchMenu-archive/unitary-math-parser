import {createBaseFeature} from "../createBaseFeature";
import {createEvaluator} from "../createEvaluator";
import {ICSTLeaf} from "../_types/CST/ICSTLeaf";
import {dateToken, formatToken} from "./tokens";
import {date} from "./util/dates/date";

/**
 * The feature to take care of reading dates
 */
export const dateBaseFeature = createBaseFeature<{
    CST: [ICSTLeaf];
    AST: {value: Date};
    name: "date";
}>({
    name: "date",
    parse: {
        tokens: [dateToken, formatToken],
        exec({createNode, createLeaf, parser}) {
            const {addChild, finish} = createNode();
            addChild(createLeaf(parser.consume(1, dateToken)));
            return finish();
        },
    },
    abstract: ({children: [date]}) => ({
        value: new Date(date.text),
    }),
    recurse: node => node,
    evaluate: [createEvaluator({}, ({value}: {value: Date}) => date.create(value))],
});
