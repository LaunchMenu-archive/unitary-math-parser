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
    });
    describe("parsing", () => {
        it("Should handle simple date parsing", () => {
            const date = new Date("2019-5-15");
            const format = createDateFormat("d/m/Y");
            expectDate(format.decode("15/05/2019"), date);
        });
    });
    describe("Error handling", () => {});
});
