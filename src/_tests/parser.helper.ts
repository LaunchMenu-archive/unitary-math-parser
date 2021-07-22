import {addFeature} from "../features/addFeature";
import {groupRecoveryFeature} from "../features/groupRecovery/groupRecoveryFeature";
import {multiplyFeature} from "../features/multiplyFeature";
import {numberBaseFeature} from "../features/numberBaseFeature";
import {Parser} from "../Parser";
import {groupRecoveryBaseFeature} from "../features/groupRecovery/groupRecoveryBaseFeature";
import {unarySubtractFeature} from "../features/unarySubtractFeature";
import {functionBaseFeature} from "../features/functions/functionBaseFeature";
import {unitOrVarBaseFeature} from "../features/variables/unitOrVarBaseFeature";
import {varBaseFeature} from "../features/variables/varBaseFeature";
import {unitBaseFeature} from "../features/variables/unitBaseFeature";
import {factorialFeature} from "../features/factorialFunction";
import {powerFeature} from "../features/powerFeature";
import {moduloFeature} from "../features/moduloFeature";
import {unaryAddFeature} from "../features/unaryAddFeature";
import {unitConversionFeature} from "../features/unitConversionFeature";
import {implicitMultiplyFeature} from "../features/implicitMultiplyFeature";
import {divideFeature} from "../features/divideFeature";
import {subtractFeature} from "../features/subtractFeature";

export function getParser() {
    return new Parser({
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
}
