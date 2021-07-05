import {createParser} from "./createParser";
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

const parse = createParser({
    features: [groupRecoveryFeature, prefixFeature, addFeature, multiplyFeature],
    baseFeatures: [
        numberBaseFeature,
        functionBaseFeature,
        groupBaseFeature,
        groupRecoveryBaseFeature,
    ],
});
const result = parse("$4)+max(4*2)+5)");
const tree = result.parse();
if (tree.type == "function") {
    const arg = tree.args[0];
    if (arg.type == "multiply") console.log(arg.factor1);
}
console.log(tree);
debugger;

const result2 = parse("$4+max(4*2)+5").parse();
console.log(result2);
