import {addFeature} from "../features/addFeature";
import {groupRecoveryFeature} from "../features/groupRecovery/groupRecoveryFeature";
import {multiplyFeature} from "../features/multiplyFeature";
import {numberBaseFeature} from "../features/number/numberBaseFeature";
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
import {conversionFeature} from "../features/conversionFeature";
import {implicitMultiplyFeature} from "../features/implicitMultiplyFeature";
import {divideFeature} from "../features/divideFeature";
import {subtractFeature} from "../features/subtractFeature";
import {formattedNumberBaseFeature} from "../features/number/formattedNumberBaseFeature";
import {binaryNumberBaseFeature} from "../features/number/binaryNumberBaseFeature";
import {hexadecimalNumberBaseFeature} from "../features/number/hexadecimalNumberBaseFeature";
import {octalNumberBaseFeature} from "../features/number/octalNumberBaseFeature";

export function getParser() {
    return new Parser({
        features: [
            groupRecoveryFeature,
            addFeature,
            subtractFeature,
            multiplyFeature,
            divideFeature,
            implicitMultiplyFeature,
            conversionFeature,
            unarySubtractFeature,
            unaryAddFeature,
            moduloFeature,
            powerFeature,
            factorialFeature,
        ],
        baseFeatures: [
            formattedNumberBaseFeature,
            functionBaseFeature,
            groupRecoveryBaseFeature,
            unitOrVarBaseFeature,
            varBaseFeature,
            unitBaseFeature,
            numberBaseFeature,
            binaryNumberBaseFeature,
            hexadecimalNumberBaseFeature,
            octalNumberBaseFeature,
        ],
    });
}
