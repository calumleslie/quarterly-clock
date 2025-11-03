import {
    addMonths,
    addYears,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    isAfter,
    subMilliseconds,
} from "date-fns";
import { QuarterSpecification } from "./quarterSpecification";

export function currentYearInterval(quarterSpec: QuarterSpecification, now: Date): YearInterval {
    // This only works when yearStartMonth is positive; in practice this is all we need, though if
    // we want to support something beyond quarters you might need to know where the year of a given
    // number starts relative to the calendar year of that number
    const yearMatchesCalendar = !isAfter(new Date(now.getFullYear(), quarterSpec.yearStartMonth), now);
    const yearNumber = yearMatchesCalendar ? now.getFullYear() : now.getFullYear() - 1;
    const yearStart = new Date(yearNumber, quarterSpec.yearStartMonth);

    return new YearInterval(yearStart);
}

// Represents a year interval starting on a given date
class YearInterval {
    startDate: Date;
    constructor(startDate: Date) {
        this.startDate = startDate;
    }

    get endDate(): Date {
        return subMilliseconds(addYears(this.startDate, 1), 1);
    }

    get daysInYear(): number {
        return this.dayOfYear(addYears(this.startDate, 1)) - 1;
    }

    dayOfYear(date: Date): number {
        return differenceInCalendarDays(date, this.startDate) + 1;
    }

    quarterOf(date: Date): number {
        return Math.floor(differenceInCalendarMonths(date, this.startDate) / 3) + 1;
    }

    startOfQuarter(quarter: number): Date {
        // Quarters are 1-indexed
        return addMonths(this.startDate, 3 * (quarter - 1));
    }

    yearFraction(date: Date): number {
        // The code this replaced used 1-indexed days throughout so we do the same here; this
        // tends to make these calculations off by one
        const day = this.dayOfYear(date);

        // We calculate proportion through the next year if this doesn't fall within this
        // year. This still uses the length of _this_ year since the intent is to calculate
        // an angle around a circle representing this year.
        return (((day - 1) % this.daysInYear) + 1) / this.daysInYear;
    }
}