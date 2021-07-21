import {addFeature} from "./features/addFeature";
import {groupRecoveryFeature} from "./features/groupRecovery/groupRecoveryFeature";
import {functionBaseFeature} from "./features/functions/functionBaseFeature";
import {multiplyFeature} from "./features/multiplyFeature";
import {numberBaseFeature} from "./features/numberBaseFeature";
import {Parser} from "./Parser";
import {groupRecoveryBaseFeature} from "./features/groupRecovery/groupRecoveryBaseFeature";
import {ICST} from "./_types/CST/ICST";
import {isError} from "./parser/isError";
import {unitOrVarBaseFeature} from "./features/variables/unitOrVarBaseFeature";
import {subtractFeature} from "./features/subtractFeature";
import {divideFeature} from "./features/divideFeature";
import {implicitMultiplyFeature} from "./features/implicitMultiplyFeature";
import {EvaluationContext} from "./parser/AST/EvaluationContext";
import {unitConfigContextIdentifier} from "./features/variables/unitConfigContextIdentifier";
import {varBaseFeature} from "./features/variables/varBaseFeature";
import {unitBaseFeature} from "./features/variables/unitBaseFeature";
import {unitConversionFeature} from "./features/unitConversionFeature";
import {unarySubtractFeature} from "./features/unarySubtractFeature";
import {unaryAddFeature} from "./features/unaryAddFeature";
import {moduloFeature} from "./features/moduloFeature";
import {powerFeature} from "./features/powerFeature";
import {factorialFeature} from "./features/factorialFunction";
import {number} from "./features/util/number/number";
import {unitAugmentation} from "./features/util/number/unitAugmentation";
import {approximationAugmentation} from "./features/util/number/approximationAugmentation";

// Things that remain to be done:
// TODO: Add more units and dimensions, E.g. american units, angles and temperatures
// TODO: Add more functions, E.g. floor, ceil, max, min, sin, cos, log, root
// TODO: Add value formats system
// TODO: Create unit tests
// TODO: Add date type
// TODO: Add list type
// TODO: Make a high level wrapper such that it's easy to use for the default case
// TODO: Make the index export all relevant things

const parser = new Parser({
    features: [
        groupRecoveryFeature,
        addFeature,
        subtractFeature,
        multiplyFeature,
        divideFeature,
        implicitMultiplyFeature,
        unitConversionFeature,
        unarySubtractFeature,
        unaryAddFeature,
        moduloFeature,
        powerFeature,
        factorialFeature,
    ],
    baseFeatures: [
        numberBaseFeature,
        functionBaseFeature,
        groupRecoveryBaseFeature,
        unitOrVarBaseFeature,
        varBaseFeature,
        unitBaseFeature,
    ],
});
const input = "5.1!+2+6+12+34)/20";
// const input = "(6meter)!";
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
    const evalResult = parser.evaluate(
        input,
        new EvaluationContext().augment(unitConfigContextIdentifier, {customUnits: true})
    );
    console.timeEnd("eval");
    if (isError(evalResult)) {
        evalResult.errors.forEach(error => console.log(error.multilineMessage));
    } else if (evalResult.isA(number)) {
        console.log(input + " =");
        console.log(
            evalResult.data,
            evalResult.getAugmentation(unitAugmentation).unit + "",
            evalResult.getAugmentation(approximationAugmentation)
        );
    }
}

// const result2 = parse("$4+max(4*2)+5").parse();
// console.log(result2);

function toString(tree: ICST, debug: boolean = false): string {
    if ("text" in tree) return tree.text;
    const children = tree.children.map(child => toString(child, debug)).join("");
    return debug ? `[${children}]` : children;
}
