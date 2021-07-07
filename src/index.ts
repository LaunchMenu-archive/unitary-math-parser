import {addFeature} from "./features/addFeature";
import {
    groupRecoveryBaseFeature,
    groupRecoveryFeature,
} from "./features/bracketRecoveryFeature";
import {functionBaseFeature} from "./features/functionBaseFeature";
import {groupBaseFeature} from "./features/groupBaseFeature";
import {multiplyFeature} from "./features/multiplyFeature";
import {numberBaseFeature} from "./features/numberBaseFeature";
import {prefixFeature} from "./features/prefixTestFeature";
import {Parser} from "./Parser";

const parser = new Parser({
    features: [groupRecoveryFeature, prefixFeature, addFeature, multiplyFeature],
    baseFeatures: [
        numberBaseFeature,
        functionBaseFeature,
        groupBaseFeature,
        groupRecoveryBaseFeature,
    ],
});
const result = parser.parse("$4)+max(4*2,4))++5)");
if ("errors" in result) {
    console.log(...result.errors.map(({multilineMessage}) => multilineMessage));
} else {
    const tree = result.ast;
    if (tree.type == "function") {
        const arg = tree.args[0];
        if (arg.type == "multiply") console.log(arg.factor1);
    }
    console.log(tree);
    debugger;
}

// const result2 = parse("$4+max(4*2)+5").parse();
// console.log(result2);
