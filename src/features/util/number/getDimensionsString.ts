import {IDimension} from "../../../_types/evaluation/number/IDimension";
import {IUnitDimensions} from "../../../_types/evaluation/number/IUnitDimensions";

/**
 * Retrieves the given dimensions represented as a string
 * @param dimensions The dimensions
 * @returns The string version of the dimensions
 */
export function getDimensionsString(dimensions: IUnitDimensions): string {
    const getDimensionString = (dimensions: IDimension[]) =>
        dimensions
            .reduce<{dimension: IDimension; amount: number}[]>(
                (items, dimension) =>
                    items.find(item => item.dimension == dimension)
                        ? items.map(item =>
                              item.dimension == dimension
                                  ? {...item, amount: item.amount + 1}
                                  : item
                          )
                        : [...items, {dimension, amount: 1}],
                []
            )
            .map(
                ({amount, dimension}) => dimension.name + (amount > 1 ? `^${amount}` : "")
            )
            .join("*");

    if (dimensions.numerator.length == 0 && dimensions.denominator.length == 0) return "";

    const numerator = getDimensionString(dimensions.numerator);
    const denominator = getDimensionString(dimensions.denominator);
    return (
        (dimensions.numerator.length > 0
            ? "" + (dimensions.numerator.length > 1 ? `(${numerator})` : numerator)
            : "1") +
        (dimensions.denominator.length > 0
            ? "/" + (dimensions.denominator.length > 1 ? `(${denominator})` : denominator)
            : "")
    );
}
