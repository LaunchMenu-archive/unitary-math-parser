import {expectError} from "./resultCheck.helper";

describe("Evaluation errors", () => {
    describe("Tokenization errors", () => {
        it("Should error on unknown tokens", () => {
            expectError("&4-|*3", [
                {message: pt => `Unexpected character "&" found:\n${pt}`, start: 0},
                {message: pt => `Unexpected character "|" found:\n${pt}`, start: 3},
            ]);
        });
        it("Should error on unexpected EOF", () => {
            expectError("34 - 3 * 4 * +", [
                {
                    message: pt =>
                        `Found unexpected end of file:\n${pt}\nExpected either "+", "-", formatted-number, text, "(", "$", "#", number, binary-number, hex-number or octal-number`,
                    start: parseInt("shit"),
                },
            ]);
        });
        it("Should error on invalid structure", () => {
            expectError("34 - 3 * * 4", [
                {
                    message: pt =>
                        `Found unexpected character "*":\n${pt}\nExpected either "+", "-", formatted-number, text, "(", "$", "#", number, binary-number, hex-number or octal-number`,
                    start: 9,
                },
            ]);
        });
        it("Should error on expected EOF", () => {
            expectError("34 - 3 , 4 + 4", [
                {
                    message: pt =>
                        `Found unexpected character ",":\n${pt}\nExpected end of file`,
                    start: 7,
                },
            ]);
        });
    });
});
