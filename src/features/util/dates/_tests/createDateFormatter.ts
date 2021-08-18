import {createDateFormat} from "../createDateFormat";
import {IFormatDecodeResult} from "../../formats/_types/IValueFormat";
import {EvaluationContext} from "../../../../parser/AST/EvaluationContext";

function expectDate(result: IFormatDecodeResult<Date>, date: Date) {
    if ("value" in result) {
        expect(result.value.toString()).toEqual(date.toString());
    } else {
        expect(result).toEqual(undefined);
    }
}
const context = new EvaluationContext();

describe("createDateFormatter", () => {
    describe("Formatting", () => {
        it("Should handle simple date formatting", () => {
            const date = new Date("2019-5-15");
            const format = createDateFormat("d/m/Y");
            expect(format.encode(date, context)).toEqual("15/05/2019");

            const format2 = createDateFormat("y-n-j");
            expect(format2.encode(date, context)).toEqual("19-5-15");
        });
        describe("Should handle all symbols", () => {
            const dates = [
                new Date("2020-9-15 23:45:23"),
                new Date("2019-10-3 8:05:15.342"),
                new Date("2010-1-2 0:30:3.5"),
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
                // Time
                ["a", ["pm", "am", "am"]],
                ["A", ["PM", "AM", "AM"]],
                ["B", ["323", "670", "395"]],
                ["g", ["11", "8", "12"]],
                ["G", ["23", "8", "0"]],
                ["h", ["11", "08", "12"]],
                ["H", ["23", "08", "00"]],
                ["i", ["45", "05", "30"]],
                ["s", ["23", "15", "03"]],
                ["u", ["000000", "342000", "500000"]],
                ["v", ["000", "342", "500"]],
            ] as const;

            for (let [key, results] of tests) {
                it(`Should handle '${key}'`, () => {
                    const format = createDateFormat(key);
                    dates.forEach((date, i) => {
                        expect(format.encode(date, context)).toEqual(results[i]);
                    });
                });
            }
        });
        describe("Should handle advanced formats", () => {
            const date = new Date("2010-1-2");

            const format = createDateFormat("l, jS \\o\\f F Y");
            expect(format.encode(date, context)).toEqual("Saturday, 2nd of January 2010");
        });
    });
    describe("parsing", () => {
        it("Should handle simple date parsing", () => {
            const date = new Date("2019-5-15");
            const format = createDateFormat("d/m/Y");
            expectDate(format.decode("15/05/2019", context), date);
        });
        describe("Should handle all symbols", () => {
            const d1 = "2020-9-15";
            const d2 = "2019-10-3";
            const d3 = "2010-1-2";
            const t1 = "23:45:23.0";
            const t2 = "8:05:15.342";
            const t3 = "0:30:3.5";
            const dates = [
                new Date(`${d1} ${t1}`),
                new Date(`${d2} ${t2}`),
                new Date(`${d3} ${t3}`),
            ];

            const d = "Y-m-d";
            const t = "H:i:s.v";

            // prettier-ignore
            const tests = [
                // Days
                ["d", `Y-m-d ${t}`, [`2020-9-15 ${t1}`, `2019-10-03 ${t2}`, `2010-1-02 ${t3}`]],
                ["D", `Y W D ${t}`, [`2020 38 Tue ${t1}`, `2019 40 Thu ${t2}`, `2010 53 Sat ${t3}`]],
                ["j", `Y-m-j ${t}`, [`2020-9-15 ${t1}`, `2019-10-3 ${t2}`, `2010-1-2 ${t3}`]],
                [ "l", `Y W l ${t}`, [`2020 38 Tuesday ${t1}`, `2019 40 Thursday ${t2}`, `2010 53 Saturday ${t3}`]],
                ["N", `Y W N ${t}`, [`2020 38 2 ${t1}`, `2019 40 4 ${t2}`, `2010 53 6 ${t3}`]],
                ["S", `dS m Y ${t}`, [`15th 9 2020 ${t1}`, `3rd 10 2019 ${t2}`, `2nd 1 2010 ${t3}`]],
                ["w", `Y W w ${t}`, [`2020 38 1 ${t1}`, `2019 40 3 ${t2}`, `2010 53 5 ${t3}`]],
                ["z", `Y z ${t}`, [`2020 258 ${t1}`, `2019 275 ${t2}`, `2010 1 ${t3}`]],
                // Months
                ["F", `d F Y ${t}`, [`15 September 2020 ${t1}`, `3 October 2019 ${t2}`, `2 January 2010 ${t3}`]],
                ["m", `Y-m-d ${t}`, [`2020-09-15 ${t1}`, `2019-10-03 ${t2}`, `2010-1-02 ${t3}`]],
                ["M", `d M Y ${t}`, [`15 Sep 2020 ${t1}`, `3 Oct 2019 ${t2}`, `2 Jan 2010 ${t3}`]],
                ["n", `Y-n-d ${t}`, [`2020-9-15 ${t1}`, `2019-10-03 ${t2}`, `2010-1-02 ${t3}`]],
                ["t", `Y-m-d t ${t}`, [`2020-09-15 30 ${t1}`, `2019-10-03 31 ${t2}`, `2010-1-02 31 ${t3}`]],
                // Week
                ["W", `Y W D ${t}`, [`2020 38 Tue ${t1}`, `2019 40 Thu ${t2}`, `2010 53 Sat ${t3}`]],
                // Years
                ["L", `Y-m-d L ${t}`, [`2020-09-15 1 ${t1}`, `2019-10-03 0 ${t2}`, `2010-1-02 0 ${t3}`]],
                // ["o", "", ["", "", ""]], // Can't be parsed
                ["Y", `Y-m-d ${t}`, [`2020-09-15 ${t1}`, `2019-10-03 ${t2}`, `2010-1-02 ${t3}`]],
                ["y", `y-m-d ${t}`, [`20-09-15 ${t1}`, `19-10-03 ${t2}`, `10-1-02 ${t3}`]],
                // Time
                ["a", `${d} h:i:s.va`, [`${d1} 11:45:23.0pm`, `${d2} 08:05:15.342am`, `${d3} 12:30:3.5am`]],
                ["A", `${d} h:i:s.vA`, [`${d1} 11:45:23.0PM`, `${d2} 08:05:15.342AM`, `${d3} 12:30:3.5AM`]],
                ["g", `${d} g:i:s.va`, [`${d1} 11:45:23.0pm`, `${d2} 8:05:15.342am`, `${d3} 12:30:3.5am`]],
                ["G", `${d} G:i:s.v`, [`${d1} 23:45:23.0`, `${d2} 8:05:15.342`, `${d3} 0:30:3.5`]],
                ["h", `${d} h:i:s.va`, [`${d1} 11:45:23.0pm`, `${d2} 8:05:15.342am`, `${d3} 12:30:3.5am`]],
                ["H", `${d} H:i:s.v`, [`${d1} 23:45:23.0`, `${d2} 8:05:15.342`, `${d3} 0:30:3.5`]],
                ["i", `${d} H:i:s.v`, [`${d1} 23:45:23.0`, `${d2} 8:05:15.342`, `${d3} 0:30:3.5`]],
                ["s", `${d} H:i:s.v`, [`${d1} 23:45:23.0`, `${d2} 8:05:15.342`, `${d3} 0:30:3.5`]],
                ["u", `${d} H:i:s.u`, [`${d1} 23:45:23.000000`, `${d2} 8:05:15.342000`, `${d3} 0:30:3.500000`]],
                ["v", `${d} H:i:s.v`, [`${d1} 23:45:23.000`, `${d2} 8:05:15.342`, `${d3} 0:30:3.500`]],
            ] as const;

            for (let [key, formatText, results] of tests) {
                it(`Should handle '${key}'`, () => {
                    const format = createDateFormat(formatText);
                    dates.forEach((date, i) => {
                        expectDate(format.decode(results[i], context), date);
                    });
                });
            }

            it("Should handle 'B'", () => {
                const format = createDateFormat(`${d} B`);
                // TODO: write swatch test
                // expectDate(format.decode(, context), new Date("2020-10-8 08:41:45"));
            });
        });
        describe("Should handle advanced formats", () => {
            const date = new Date("2010-1-2");

            const format = createDateFormat("l, jS \\o\\f F Y");
            expectDate(format.decode("Saturday, 2nd of January 2010", context), date);
        });
    });
    describe("Error handling", () => {
        it("Should create a parsing error if the wrong kind of data is found", () => {
            const format1 = createDateFormat("d F Y");
            expect(format1.decode("15 9 2020", context)).toEqual({
                index: 3,
                errorType: "F",
                errorMessage: "Expected a full month representation, E.g. January",
            });

            const format2 = createDateFormat("j-m-Y");
            expect(format2.decode("150-9-2020", context)).toEqual({
                index: 2,
                errorType: "-",
                errorMessage: `Expected the symbol "-"`,
            });
        });
    });
});
