import {expectError, expectResult} from "./resultCheck.helper";

describe("NumberBaseFeature", () => {
    it("Should properly parse plain numbers", () => {
        expectResult("32", 32);
        expectResult("32.5", 32.5);
    });
    it("Should deal with scientific notation", () => {
        expectResult("32.5e3", 32500);
        expectResult("32.5e-3", 0.0325);
    });
});
describe("FormattedNumberBaseFeature", () => {
    it("Should properly parse formatted numbers", () => {
        expectResult("101 as binary", 5);
        expectResult("Fe as hexadecimal", 254);
        expectResult("202 as base3", 20);
    });
    it("Should properly parse fractions", () => {
        expectResult("101.01 as binary", 5.25);
        expectResult("f.d as hex", 15.8125);
    });
    it("Should support scientific notation", () => {
        expectResult("101.01e10 as binary", 21);
        expectResult("101.01e-10 as binary", 1.3125);
        expectResult("101e-10 as binary", 1.25);
    });
    it("Should error if the format doesn't support the value", () => {
        expectError("1401 as binary", [
            {
                message: pt => `Unexpected character found for binary:\n${pt}`,
                start: 1,
            },
        ]);
    });
});
describe("BinaryNumberBaseFeature", () => {
    it("Should properly parse binary numbers", () => {
        expectResult("0b1011", 11);
        expectResult("0b10001", 17);
    });
    it("Should properly parse fractions", () => {
        expectResult("0b101.11", 5.75);
        expectResult("0b100.01", 4.25);
    });
    it("Should support scientific notation", () => {
        expectResult("0b101.111e10", 23.5);
        expectResult("0b101.1e-1", 2.75);
    });
});
describe("OctalNumberBaseFeature", () => {
    it("Should properly parse octal numbers", () => {
        expectResult("0o71", 57);
        expectResult("0o10", 8);
    });
    it("Should properly parse fractions", () => {
        expectResult("0o21.21", 17.265625);
        expectResult("0o15.4", 13.5);
    });
    it("Should support scientific notation", () => {
        expectResult("0o21.21e4", 70720);
        expectResult("0o21e-1", 2.125);
    });
});
describe("HexadecimalNumberBaseFeature", () => {
    it("Should properly parse hex numbers", () => {
        expectResult("0xf2", 242);
        expectResult("0x10", 16);
    });
    it("Should properly parse fractions", () => {
        expectResult("0x21.21", 33.12890625);
        expectResult("0x15.4", 21.25);
    });
});
