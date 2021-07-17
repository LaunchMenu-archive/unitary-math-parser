import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {IASTExpression} from "../_types/AST/IASTExpression";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {numberBaseFeature} from "./numberBaseFeature";
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";

// TODO: add context and settings for `simplify` calls
export const multiplyEvaluator = createEvaluator(
    {left: isNumber, right: isNumber},
    ({left, right}: {left: IUnitaryNumber; right: IUnitaryNumber}): IUnitaryNumber => {
        const isUnit = left.isUnit && right.isUnit;
        const unit = left.unit.createNew(
            {
                numerator: [...left.unit.numerator, ...right.unit.numerator],
                denominator: [...left.unit.denominator, ...right.unit.denominator],
            },
            {sortUnits: !isUnit}
        );
        const simplifiedUnit = unit.simplify();
        return simplifiedUnit.convert(
            createNumber(left.value * right.value, unit, isUnit)
        )!;
    }
);

export const implicitMultiplyFeature = createFeature<{
    CST: [IASTExpression, IASTExpression];
    AST: IBinaryASTData;
    name: "implicitMultiply";
}>({
    name: "implicitMultiply",
    parse: {
        tokens: [spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {lowerThan: [numberBaseFeature]},
    },
    abstract: ({children: [left, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [multiplyEvaluator],
});
