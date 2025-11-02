import {
  add,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInWeeks,
  eachDayOfInterval,
  eachWeekendOfInterval,
  getISOWeeksInYear,
  isAfter,
  startOfISOWeekYear,
  startOfWeek,
  subMilliseconds,
  toDate
} from "date-fns";

// Input is expected to be a URLSearchParams instance
export function parseParameters(params) {
  // We zero-index months internally because JS does but we don't expose that in the
  // API since it's weird
  const yearStartMonth = parseInt(params.get('yearStartMonth') || '1') - 1;
  return {
    yearStartMonth
  };
}

function currentModelYear(yearStartMonth, now) {
  // This only works when yearStartMonth is positive; in practice this is all we need, though if
  // we want to support something beyond quarters you might need to know where the year of a given
  // number starts relative to the calendar year of that number
  const yearMatchesCalendar = !isAfter(new Date(now.getFullYear(), yearStartMonth), now);
  const yearNumber = yearMatchesCalendar ? now.getFullYear() : now.getFullYear() - 1;
  const yearStart = new Date(yearNumber, yearStartMonth);

  return new YearInterval(yearStart);
}

// Represents a year interval starting on a given date
class YearInterval {
  constructor(startDate) {
    this.startDate = startDate;
  }

  get endDate() {
    return subMilliseconds(addYears(this.startDate, 1), 1);
  }

  get daysInYear() {
    return this.dayOfYear(addYears(this.startDate, 1)) - 1;
  }

  dayOfYear(date) {
    return differenceInCalendarDays(date, this.startDate) + 1;
  }

  quarterOf(date) {
    return Math.floor(differenceInCalendarMonths(date, this.startDate) / 3) + 1;
  }

  startOfQuarter(quarter) {
    // Quarters are 1-indexed
    return addMonths(this.startDate, 3 * (quarter - 1));
  }

  yearFraction(date) {
    // The code this replaced used 1-indexed days throughout so we do the same here; this
    // tends to make these calculations off by one
    const day = this.dayOfYear(date);

    // We calculate proportion through the next year if this doesn't fall within this
    // year. This still uses the length of _this_ year since the intent is to calculate
    // an angle around a circle representing this year.
    return (((day - 1) % this.daysInYear) + 1) / this.daysInYear;
  }
}

export function modelForDate(now, args) {
  now = toDate(now);
  args = args || {};

  const year = currentModelYear(args.yearStartMonth || 0, now);

  const elapsedInWholeDays = year.dayOfYear(now);
  const daysInYear = year.daysInYear;

  const thisDayButNextWeek = add(now, { weeks: 1 });
  const startOfNextWeek = startOfWeek(thisDayButNextWeek);

  const currentQuarter = year.quarterOf(now);
  const startOfCurrentQuarter = year.startOfQuarter(currentQuarter);
  const endOfCurrentQuarter = subMilliseconds(year.startOfQuarter(currentQuarter + 1), 1);
  const wholeWeeksLeftInCurrentQuarter = Math.abs(
    differenceInWeeks(endOfCurrentQuarter, startOfNextWeek)
  );
  const startOfCurrentYear = year.startDate;
  const endOfCurrentYear = year.endDate;
  const isoStart = startOfISOWeekYear(now);
  const isoWeeks = getISOWeeksInYear(now);
  const range = [...Array(isoWeeks).keys()];
  const weeksInYear = range.map((multiplier) => {
    const label = `${multiplier + 1}`;
    const start = add(isoStart, { weeks: multiplier });
    return {
      label,
      start,
    };
  });

  // find all weekends in the current quarter that are still ahead
  const remainingInterval = {
    start: startOfNextWeek,
    end: add(startOfNextWeek, { weeks: wholeWeeksLeftInCurrentQuarter }),
  };
  const weekends = eachWeekendOfInterval(remainingInterval);
  const allDays = eachDayOfInterval(remainingInterval);
  const nonWeekendDays = allDays.filter((d) => {
    return !weekends.find((w) => w.getTime() === d.getTime());
  });
  return {
    elapsed: {
      yearFraction: elapsedInWholeDays / daysInYear,
    },
    currentQuarter: {
      index: currentQuarter - 1,
      label: `Q${currentQuarter}`,
      start: {
        yearFraction: year.yearFraction(startOfCurrentQuarter),
      },
      end: {
        yearFraction: year.yearFraction(endOfCurrentQuarter),
      },
      wholeWeeksLeft: {
        start: {
          yearFraction: year.yearFraction(startOfNextWeek),
        },
        end: {
          yearFraction:
            year.yearFraction(addWeeks(startOfNextWeek, wholeWeeksLeftInCurrentQuarter)),
        },
        durationInWeeks: wholeWeeksLeftInCurrentQuarter,
      },
      availableDays: nonWeekendDays.map((date) => ({
        day: year.dayOfYear(date),
        start: { yearFraction: year.yearFraction(date) },
        end: { yearFraction: year.yearFraction(add(date, { days: 1 })) },
      })),
    },
    startOfYear: startOfCurrentYear,
    endOfYear: endOfCurrentYear,
    weeks: weeksInYear,
  };
}
