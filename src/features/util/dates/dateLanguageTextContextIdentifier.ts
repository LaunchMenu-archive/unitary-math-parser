import {createEvaluationContextIdentifier} from "../../../parser/AST/createEvaluationContextIdentifier";
import {createLanguageTextChecker} from "./createLanguageTextChecker";
import {IDateLanguageTexts} from "./_types/IDateLanguageTexts";

/** A context identifier to retrieve the texts used for a date in any language */
export const dateLanguageTextContextIdentifier = createEvaluationContextIdentifier(
    "date language",
    (): IDateLanguageTexts => ({
        daysOfWeekShort: createLanguageTextChecker([
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
        ]),
        daysOfWeek: createLanguageTextChecker([
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]),
        ordinalSuffix: createLanguageTextChecker(
            ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"],
            true
        ),
        monthsShort: createLanguageTextChecker([
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]),
        months: createLanguageTextChecker([
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]),
        amOrPm: createLanguageTextChecker(["am", "pm"]),
        AMorPM: createLanguageTextChecker(["AM", "PM"]),
    })
);
