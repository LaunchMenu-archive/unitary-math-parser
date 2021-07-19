import {createToken} from "chevrotain";
import {createEvaluator} from "../createEvaluator";
import {createFeature} from "../createFeature";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IUnitaryNumber} from "../_types/evaluation/number/IUnitaryNumber";
import {multiplyFeature} from "./multiplyFeature";
import {createNumber} from "./util/number/createNumber";
import {isNumber} from "./util/number/isNumber";
import {spaceToken} from "./util/spaceToken";
import {IBinaryASTData} from "./util/_types/IBinaryASTData";
import {IBinaryCSTData} from "./util/_types/IBinaryCSTData";
import {unitConfigContextIdentifier} from "./variables/unitConfigContextIdentifier";

export const divideToken = createToken({name: "DIVIDE", pattern: /\//, label: '"/"'});
/**
 * The feature to take care of division when encountering `/`
 */
export const divideFeature = createFeature<{
    CST: IBinaryCSTData;
    AST: IBinaryASTData;
    name: "divide";
}>({
    name: "divide",
    parse: {
        tokens: [divideToken, spaceToken],
        type: "infix",
        associativity: "left",
        exec(node, {nextRule, parser, createNode, createLeaf}) {
            const {addChild, finish} = createNode();
            addChild(node);
            addChild(createLeaf(parser.consume(0, divideToken)));
            addChild(parser.subrule(2, nextRule));
            return finish();
        },
        precedence: {sameAs: [multiplyFeature]},
    },
    abstract: ({children: [left, op, right]}) => ({left, right}),
    recurse: ({left, right, ...rest}, recurse) => ({
        left: recurse(left),
        right: recurse(right),
        ...rest,
    }),
    evaluate: [
        createEvaluator(
            {left: isNumber, right: isNumber},
            (
                {
                    left,
                    right,
                }: {
                    left: IUnitaryNumber;
                    right: IUnitaryNumber;
                },
                context: EvaluationContext
            ): IUnitaryNumber => {
                const unitConfig = context.get(unitConfigContextIdentifier);

                const isUnit = left.isUnit && right.isUnit;
                const unit = left.unit.createNew(
                    {
                        numerator: [...left.unit.numerator, ...right.unit.denominator],
                        denominator: [...left.unit.denominator, ...right.unit.numerator],
                    },
                    {sortUnits: !isUnit && unitConfig.sortUnits}
                );
                const simplifiedUnit = unit.simplify(unitConfig.simplification);
                return simplifiedUnit.convert(
                    createNumber(left.value / right.value, unit, isUnit)
                )!;
            }
        ),
    ],
});
