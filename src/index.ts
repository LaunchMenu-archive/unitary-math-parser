import {addFeature} from "./features/addFeature";
import {groupRecoveryFeature} from "./features/groupRecovery/groupRecoveryFeature";
import {functionBaseFeature} from "./features/functionBaseFeature";
import {multiplyFeature} from "./features/multiplyFeature";
import {numberBaseFeature} from "./features/numberBaseFeature";
import {prefixFeature} from "./features/prefixTestFeature";
import {Parser} from "./Parser";
import {groupRecoveryBaseFeature} from "./features/groupRecovery/groupRecoveryBaseFeature";
import {ICST} from "./_types/CST/ICST";

const parser = new Parser({
    features: [groupRecoveryFeature, prefixFeature, addFeature, multiplyFeature],
    baseFeatures: [numberBaseFeature, functionBaseFeature, groupRecoveryBaseFeature],
});
const input = "3*4*5+4+6*5)+(5+6*5)";
const result = parser.parse(input);
if ("errors" in result) {
    console.log(...result.errors.map(({multilineMessage}) => multilineMessage));
} else {
    const tree = result.ast.tree;
    if (tree.type == "function") {
        const arg = tree.args[0];
        if (arg.type == "multiply") console.log(arg.factor1);
    }
    if (tree.type == "multiply") {
        const f1 = tree.factor1;
        if (f1.type == "number") {
        }
    }

    if (result.containsCorrection) {
        console.log(`"${input}" could also have been:`);
        console.time();
        for (let altResult of result.getCorrectionAlternatives()) {
            console.log(toString(altResult.cst.tree));
        }
        console.timeEnd();
    }
}

// const result2 = parse("$4+max(4*2)+5").parse();
// console.log(result2);

function toString(tree: ICST, debug: boolean = false): string {
    if ("text" in tree) return tree.text;
    const children = tree.children.map(child => toString(child, debug)).join("");
    return debug ? `[${children}]` : children;
}
