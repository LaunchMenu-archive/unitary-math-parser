import {addFeature} from "./features/addFeature";
import {groupRecoveryFeature} from "./features/groupRecovery/groupRecoveryFeature";
import {functionBaseFeature} from "./features/functionBaseFeature";
import {multiplyFeature} from "./features/multiplyFeature";
import {numberBaseFeature} from "./features/numberBaseFeature";
import {prefixFeature} from "./features/prefixTestFeature";
import {Parser} from "./Parser";
import {groupRecoveryBaseFeature} from "./features/groupRecovery/groupRecoveryBaseFeature";
import {ICST} from "./_types/CST/ICST";
import {isError} from "./parser/isError";
import {isNumber} from "./features/util/number/isNumber";
import {unitOrVarBaseFeature} from "./features/unitOrVarBaseFeature";
import {subtractFeature} from "./features/subtractFeature";
import {divideFeature} from "./features/divideFeature";
import {implicitMultiplyFeature} from "./features/implicitMultiplyFeature";

const parser = new Parser({
    features: [
        groupRecoveryFeature,
        prefixFeature,
        addFeature,
        subtractFeature,
        multiplyFeature,
        divideFeature,
        implicitMultiplyFeature,
    ],
    baseFeatures: [
        numberBaseFeature,
        functionBaseFeature,
        groupRecoveryBaseFeature,
        unitOrVarBaseFeature,
    ],
});
const input = "5min / 20(km*km)";
// const input = "(5joule * 3kilogram)";
const result = parser.parse(input);
if ("errors" in result) {
    console.log(...result.errors.map(({multilineMessage}) => multilineMessage));
} else {
    const tree = result.ast.tree;
    if (tree.type == "function") {
        const arg = tree.args[0];
        if (arg.type == "multiply") console.log(arg.left);
    }
    if (tree.type == "multiply") {
        const f1 = tree.left;
        if (f1.type == "number") {
        }
    }

    if (result.containsCorrection) {
        console.log(`"${input}" could also have been:`);
        console.time("alternatives");
        for (let altResult of result.getCorrectionAlternatives()) {
            console.log(toString(altResult.cst.tree));
        }
        console.timeEnd("alternatives");
    }

    console.time("eval");
    const evalResult = parser.evaluate(input);
    console.timeEnd("eval");
    if (isError(evalResult)) {
        evalResult.errors.forEach(error => console.log(error.multilineMessage));
    } else if (isNumber(evalResult)) {
        console.log(input + " =");
        console.log(evalResult.value, evalResult.unit + "");
    }
}

// const result2 = parse("$4+max(4*2)+5").parse();
// console.log(result2);

function toString(tree: ICST, debug: boolean = false): string {
    if ("text" in tree) return tree.text;
    const children = tree.children.map(child => toString(child, debug)).join("");
    return debug ? `[${children}]` : children;
}
