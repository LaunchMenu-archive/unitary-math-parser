import {addFeature} from "../features/addFeature";
import {groupRecoveryFeature} from "../features/groupRecovery/groupRecoveryFeature";
import {multiplyFeature} from "../features/multiplyFeature";
import {numberBaseFeature} from "../features/numberBaseFeature";
import {Parser} from "../Parser";
import {groupRecoveryBaseFeature} from "../features/groupRecovery/groupRecoveryBaseFeature";
import {unarySubtractFeature} from "../features/unarySubtractFeature";

describe("bracketRecoveryFeature", () => {
    it("Should properly add opening brackets to the start of expressions if needed", () => {
        const parser = new Parser({
            features: [
                groupRecoveryFeature,
                unarySubtractFeature,
                addFeature,
                multiplyFeature,
            ],
            baseFeatures: [numberBaseFeature, groupRecoveryBaseFeature],
        });
        const result = parser.parse("-4+4)+4");
        if ("errors" in result) {
            const error = result.errors
                .map(({multilineMessage}) => multilineMessage)
                .join("\n");
            throw error;
        }

        const tree = result.cst as any;
        expect(tree.type).toBe("add");
        expect(tree.children[0].type).toBe("recoveryGroup");
    });
});
