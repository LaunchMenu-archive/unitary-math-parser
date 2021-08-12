import {createDateFormat} from "../createDateFormat";
import {IFormatDecodeResult} from "../../formats/_types/IValueFormat";

function expectDate(result: IFormatDecodeResult<Date>, date: Date) {
    if ("value" in result) {
        expect(result.value.toString()).toEqual(date.toString());
    } else {
        expect(result).toEqual(undefined);
    }
}

describe("createDateFormatter", () => {
    describe("Formatting", () => {
        it("Should handle simple date formatting", () => {
            const date = new Date("2019-5-15");
            const format = createDateFormat("d/m/Y");
            expect(format.encode(date)).toEqual("15/05/2019");

            const format2 = createDateFormat("y-n-j");
            expect(format2.encode(date)).toEqual("19-5-15");
        });
        describe("Should handle all symbols", () => {
            const dates = [
                new Date("2020-9-15"),
                new Date("2019-10-3"),
                new Date("2010-1-2"),
            ];
            const tests = [
                // Days
                ["d", ["15", "03", "02"]],
                ["D", ["Tue", "Thu", "Sat"]],
                ["j", ["15", "3", "2"]],
                ["l", ["Tuesday", "Thursday", "Saturday"]],
                ["N", ["2", "4", "6"]],
                ["S", ["th", "rd", "nd"]],
                ["w", ["1", "3", "5"]],
                ["z", ["258", "275", "1"]],
                // Months
                ["F", ["September", "October", "January"]],
                ["m", ["09", "10", "01"]],
                ["M", ["Sep", "Oct", "Jan"]],
                ["n", ["9", "10", "1"]],
                ["t", ["30", "31", "31"]],
                // Week
                ["W", ["38", "40", "53"]],
                // Years
                ["L", ["1", "0", "0"]],
                ["o", ["2020", "2019", "2009"]],
                ["Y", ["2020", "2019", "2010"]],
                ["y", ["20", "19", "10"]],
            ] as const;

            for (let [key, results] of tests) {
                it(`Should handle '${key}'`, () => {
                    const format = createDateFormat(key);
                    dates.forEach((date, i) => {
                        expect(format.encode(date)).toEqual(results[i]);
                    });
                });
            }
        });
        describe("Should handle advanced formats", () => {
            const date = new Date("2010-1-2");

            const format = createDateFormat("l, jS \\o\\f F Y");
            expect(format.encode(date)).toEqual("Saturday, 2nd of January 2010");
        });
    });
    describe("parsing", () => {
        it("Should handle simple date parsing", () => {
            const date = new Date("2019-5-15");
            const format = createDateFormat("d/m/Y");
            expectDate(format.decode("15/05/2019"), date);
        });
        describe("Should handle all symbols", () => {
            const dates = [
                new Date("2020-9-15"),
                new Date("2019-10-3"),
                new Date("2010-1-2"),
            ];
            const tests = [
                // Days
                ["d", "Y-m-d", ["2020-9-15", "2019-10-03", "2010-1-02"]],
                ["D", "Y W D", ["2020 38 Tue", "2019 40 Thu", "2010 53 Sat"]],
                ["j", "Y-m-j", ["2020-9-15", "2019-10-3", "2010-1-2"]],
                [
                    "l",
                    "Y W l",
                    ["2020 38 Tuesday", "2019 40 Thursday", "2010 53 Saturday"],
                ],
                ["N", "Y W N", ["2020 38 2", "2019 40 4", "2010 53 6"]],
                ["S", "dS m Y", ["15th 9 2020", "3rd 10 2019", "2nd 1 2010"]],
                ["w", "Y W w", ["2020 38 1", "2019 40 3", "2010 53 5"]],
                ["z", "Y z", ["2020 258", "2019 275", "2010 1"]],
                // Months
                ["F", "d F Y", ["15 September 2020", "3 October 2019", "2 January 2010"]],
                ["m", "Y-m-d", ["2020-09-15", "2019-10-03", "2010-1-02"]],
                ["M", "d M Y", ["15 Sep 2020", "3 Oct 2019", "2 Jan 2010"]],
                ["n", "Y-n-d", ["2020-9-15", "2019-10-03", "2010-1-02"]],
                ["t", "Y-m-d t", ["2020-09-15 30", "2019-10-03 31", "2010-1-02 31"]],
                // Week
                ["W", "Y W D", ["2020 38 Tue", "2019 40 Thu", "2010 53 Sat"]],
                // Years
                ["L", "Y-m-d L", ["2020-09-15 1", "2019-10-03 0", "2010-1-02 0"]],
                // ["o", "", ["", "", ""]], // Can't be parsed
                ["Y", "Y-m-d", ["2020-09-15", "2019-10-03", "2010-1-02"]],
                ["y", "y-m-d", ["20-09-15", "19-10-03", "10-1-02"]],
            ] as const;

            for (let [key, formatText, results] of tests) {
                it(`Should handle '${key}'`, () => {
                    const format = createDateFormat(formatText);
                    dates.forEach((date, i) => {
                        expectDate(format.decode(results[i]), date);
                    });
                });
            }
        });
        describe("Should handle advanced formats", () => {
            const date = new Date("2010-1-2");

            const format = createDateFormat("l, jS \\o\\f F Y");
            expectDate(format.decode("Saturday, 2nd of January 2010"), date);
        });
    });
    describe("Error handling", () => {});
});
