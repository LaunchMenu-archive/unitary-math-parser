import {ICST} from "../_types/CST/ICST";
import {IParseOutput} from "../parser/_types/IParseOutput";
import {IParserConfig} from "../_types/IParserConfig";
import {IParsingResult} from "../_types/IParsingResult";
import {getParser} from "./parser.helper";

describe("bracketRecoveryFeature", () => {
    describe("Opening brackets", () => {
        describe("Adds required opening brackets", () => {
            it("Should properly add 1 opening bracket to the start of expressions when needed", () => {
                const parser = getParser();
                const result = parser.parse("-4+4)/2");
                checkErrors(result);
                expect(toString(result.cst.tree, true)).toEqual("[[([[-[4]]+[4]])]/[2]]");
            });
            it("Should properly add 2 opening brackets to the start of expressions when needed", () => {
                const parser = getParser();
                const result = parser.parse("-4+4)/2)");
                checkErrors(result);
                expect(toString(result.cst.tree, true)).toEqual(
                    "[([[([[-[4]]+[4]])]/[2]])]"
                );
            });
            it("Should properly add 3 opening brackets to the start of expressions when needed", () => {
                const parser = getParser();
                const result = parser.parse("-4)+4)/2)");
                checkErrors(result);
                expect(toString(result.cst.tree, true)).toEqual(
                    "[([[([[([-[4]])]+[4]])]/[2]])]"
                );
            });
        });
        describe("Computes correct opening alternatives", () => {
            it("Computes correct alternatives for 1 bracket, removing options with equivalent interpretations", () => {
                expectAlternatives("-4+4*2)/2+3", [
                    "(-4+4*2)/2+3",
                    "-(4+4*2)/2+3",
                    // "-4+(4*2)/2+3", Not this one, since it's equivalent to the one below
                    "-4+4*2/2+3",
                ]);

                expectAlternatives("-4+4*2/2)+3", [
                    "(-4+4*2/2)+3",
                    "-(4+4*2/2)+3",
                    // "-4+(4*2/2)+3",
                    "-4+4*(2/2)+3", // Equivalent to the one below, but only because of algebraic equivalence, not because of same interpretation
                    "-4+4*2/2+3",
                ]);

                expectAlternatives("4^4^4)", [
                    "(4^4^4)",
                    // "4^(4^4)", // Power is right-associative
                    "4^4^4",
                ]);
            });
            it("Computes correct alternatives for 1 bracket, removing different multiplication/addition associations", () => {
                expectAlternatives("4*4*4*4*4)*4", [
                    "(4*4*4*4*4)*4",
                    // "4*(4*4*4*4)*4",
                    // "4*4*(4*4*4)*4",
                    // "4*4*4*(4*4)*4",
                    "4*4*4*4*4*4",
                ]);

                expectAlternatives("4*4*4*4*4/4)*4", [
                    "(4*4*4*4*4/4)*4",
                    "4*(4*4*4*4/4)*4", // At this point division is the top level operator within the group, which isn't picked up yet by the rudimentary filter, TODO: make it pick this up
                    "4*4*(4*4*4/4)*4",
                    "4*4*4*(4*4/4)*4",
                    "4*4*4*4*(4/4)*4",
                    "4*4*4*4*4/4*4",
                ]);

                expectAlternatives("4*4*4*4/4*4)*4", [
                    "(4*4*4*4/4*4)*4",
                    // "4*(4*4*4/4*4)*4",
                    // "4*4*(4*4/4*4)*4",
                    // "4*4*4*(4/4*4)*4",
                    "4*4*4*4/(4*4)*4",
                    "4*4*4*4/4*4*4",
                ]);
            });
            it("Correctly retains order of precedence when computing alternatives", () => {
                expectAlternatives(
                    "4*4*4*4*4/4)*4",
                    [
                        "[[([[[[[[4]*[4]]*[4]]*[4]]*[4]]/[4]])]*[4]]",
                        "[[[4]*[([[[[[4]*[4]]*[4]]*[4]]/[4]])]]*[4]]",
                        "[[[[4]*[4]]*[([[[[4]*[4]]*[4]]/[4]])]]*[4]]",
                        "[[[[[4]*[4]]*[4]]*[([[[4]*[4]]/[4]])]]*[4]]",
                        "[[[[[[4]*[4]]*[4]]*[4]]*[([[4]/[4]])]]*[4]]",
                        "[[[[[[[4]*[4]]*[4]]*[4]]*[4]]/[4]]*[4]]",
                    ],
                    true
                );

                expectAlternatives(
                    "4^4^4)^4",
                    [
                        "[[([[4]^[[4]^[4]]])]^[4]]",
                        "[[4]^[[([[4]^[4]])]^[4]]]",
                        "[[4]^[[4]^[[4]^[4]]]]",
                    ],
                    true
                );

                expectAlternatives(
                    "-4+4*2/2)+3",
                    [
                        "[[([[-[4]]+[[[4]*[2]]/[2]]])]+[3]]",
                        "[[-[([[4]+[[[4]*[2]]/[2]]])]]+[3]]",
                        // "-4+(4*2/2)+3",
                        "[[[-[4]]+[[4]*[([[2]/[2]])]]]+[3]]",
                        "[[[-[4]]+[[[4]*[2]]/[2]]]+[3]]",
                    ],
                    true
                );
            });
            it("Works correctly with multiple missing brackets", () => {
                expectAlternatives("-4+4)*2)/2+3", [
                    "((-4+4)*2)/2+3",
                    "(-4+4)*2/2+3", // == "(-4+4)*(2)/2+3"
                    "(-(4+4)*2)/2+3",
                    "-((4+4)*2)/2+3",
                    "-(4+4)*2/2+3", // == "-(4+4)*(2)/2+3"
                    "-(4+4*2)/2+3", // == "-4+(4*2)/2+3"
                    "(-4+4*2)/2+3", // == "(-4+(4)*2)/2+3"
                    // "-4+(4*2)/2+3",
                    "-4+4*2/2+3", // == "-4+(4)*(2)/2+3"
                ]);

                expectAlternatives("4-4)-4-4)", [
                    "((4-4)-4-4)",
                    "(4-4)-(4-4)",
                    "(4-4)-4-4",
                    "(4-4-4-4)",
                    "4-(4-4-4)",
                    "4-4-(4-4)",
                    "4-4-4-4",
                ]);
            });
        });
    });
    describe("Closing brackets", () => {
        describe("Adds required closing brackets", () => {
            it("Should properly add 1 closing bracket to the start of expressions when needed", () => {
                const parser = getParser();
                const result = parser.parse("-(4+4/2");
                checkErrors(result);
                expect(toString(result.cst.tree, true)).toEqual("[-[([[4]+[[4]/[2]]])]]");
            });
            it("Should properly add 2 closing brackets to the start of expressions when needed", () => {
                const parser = getParser();
                const result = parser.parse("-(4+(4/2");
                checkErrors(result);
                expect(toString(result.cst.tree, true)).toEqual(
                    "[-[([[4]+[([[4]/[2]])]])]]"
                );
            });
            it("Should properly add 3 closing brackets to the start of expressions when needed", () => {
                const parser = getParser();
                const result = parser.parse("(-(4+(4/2");
                checkErrors(result);
                expect(toString(result.cst.tree, true)).toEqual(
                    "[([-[([[4]+[([[4]/[2]])]])]])]"
                );
            });
        });
        describe("Computes correct closing alternatives", () => {
            it("Computes correct alternatives for 1 bracket, removing options with equivalent interpretations", () => {
                expectAlternatives("-4+(4*2/2+3", [
                    "-4+(4*2/2+3)",
                    // "-4+(4*2/2)+3",
                    // "-4+(4*2)/2+3",
                    "-4+4*2/2+3",
                ]);

                expectAlternatives("-(4+4*2/2+3", [
                    "-(4+4*2/2+3)",
                    "-(4+4*2/2)+3",
                    "-(4+4*2)/2+3",
                    "-(4+4)*2/2+3",
                    "-4+4*2/2+3",
                ]);

                expectAlternatives("(4^4^4", ["(4^4^4)", "(4^4)^4", "4^4^4"]);
                expectAlternatives("(4+4+4", [
                    "(4+4+4)",
                    // "(4+4)+4", // Addition is left-recursive
                    "4+4+4",
                ]);
            });
            it("Computes correct alternatives for 1 bracket, removing different multiplication/addition associations", () => {
                expectAlternatives("4*(4*4*4*4*4", [
                    "4*(4*4*4*4*4)",
                    // "4*(4*4*4*4)*4",
                    // "4*(4*4*4)*4*4",
                    // "4*(4*4)*4*4*4",
                    "4*4*4*4*4*4",
                ]);

                expectAlternatives("4*(4/4*4*4*4*4", [
                    "4*(4/4*4*4*4*4)",
                    // "4*(4/4*4*4*4)*4",
                    // "4*(4/4*4*4)*4*4",
                    // "4*(4/4*4)*4*4*4",
                    "4*(4/4)*4*4*4*4",
                    "4*4/4*4*4*4*4",
                ]);
            });
            it("Correctly retains order of precedence when computing alternatives", () => {
                expectAlternatives(
                    "4*(4/4*4*4*4*4",
                    [
                        "[[4]*[([[[[[[4]/[4]]*[4]]*[4]]*[4]]*[4]])]]",
                        "[[[[[[4]*[([[4]/[4]])]]*[4]]*[4]]*[4]]*[4]]",
                        "[[[[[[[4]*[4]]/[4]]*[4]]*[4]]*[4]]*[4]]",
                    ],
                    true
                );

                expectAlternatives(
                    "4+(4+4+4",
                    ["[[4]+[([[[4]+[4]]+[4]])]]", "[[[[4]+[4]]+[4]]+[4]]"],
                    true
                );

                expectAlternatives(
                    "-4+(4*2/2+3",
                    [
                        "[[-[4]]+[([[[[4]*[2]]/[2]]+[3]])]]",
                        // "[[[-[4]]+[([[[4]*[2]]/[2]])]]+[3]]",
                        // "[[[-[4]]+[[([[4]*[2]])]/[2]]]+[3]]",
                        "[[[-[4]]+[[[4]*[2]]/[2]]]+[3]]",
                    ],
                    true
                );
            });
            it("Works correctly with multiple missing brackets", () => {
                expectAlternatives("-(4+4*(2/2+3", [
                    "-(4+4*(2/2+3))",
                    "-(4+4)*(2/2+3)",
                    "-4+4*(2/2+3)", // == "-(4)+4*(2/2+3)"
                    "-(4+4*(2/2)+3)",
                    "-(4+4*(2/2))+3",
                    "-(4+4)*(2/2)+3",
                    "-4+4*(2/2)+3", // == "-4+4*(2/2)+3"
                    "-(4+4*2/2+3)", // == "-(4+4*(2)/2+3)"
                    "-(4+4*2/2)+3", // == "-(4+4*(2)/2)+3"
                    "-(4+4*2)/2+3", // == "-(4+4*(2))/2+3"
                    "-(4+4)*2/2+3", // == "-(4+4)*(2)/2+3"
                    "-4+4*2/2+3", // == "-(4)+4*(2)/2+3"
                ]);

                expectAlternatives("(4-4-(4-4", [
                    "(4-4-(4-4))",
                    // "(4-4)-(4-4)",
                    "4-4-(4-4)",
                    "(4-4-4-4)",
                    // "(4-4-4)-4",
                    // "(4-4)-4-4",
                    "4-4-4-4",
                ]);
            });
        });
    });
});

/**
 * Checks whether all given results were present for the input string
 * @param input The input string to get all alternatives for
 * @param results The results that are expected
 * @param debug Whether to check the strings including additions `[]` brackets to check associativity
 */
function expectAlternatives(input: string, results: string[], debug: boolean = false) {
    const parser = getParser();

    const result = parser.parse(input);
    checkErrors(result);

    const options = [
        result.cst,
        ...[...result.getCorrectionAlternatives()].map(({cst}) => cst),
    ].map(cst => toString(cst.tree, debug));

    expect(options.sort()).toEqual(results.sort());
}

function toString(tree: ICST, debug: boolean = false): string {
    if ("text" in tree) return tree.text;
    const children = tree.children.map(child => toString(child, debug)).join("");
    return debug ? `[${children}]` : children;
}

function checkErrors<C extends IParserConfig, I extends boolean>(
    result: IParseOutput<C, I>
): asserts result is IParsingResult<C> {
    if ("errors" in result) {
        const error = result.errors
            .map(({multilineMessage}) => multilineMessage)
            .join("\n\n");
        throw error;
    }
}
