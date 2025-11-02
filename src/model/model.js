import {
  add,
  addWeeks,
  differenceInWeeks,
  eachDayOfInterval,
  eachWeekendOfInterval,
  getISOWeeksInYear,
  startOfISOWeekYear,
  startOfWeek,
  subMilliseconds,
  toDate
} from "date-fns";
import { currentYearInterval } from "./yearInterval.js";

// Input is expected to be a URLSearchParams instance
export function parseParameters(params) {
  // We zero-index months internally because JS does but we don't expose that in the
  // API since it's weird
  const yearStartMonth = parseInt(params.get('yearStartMonth') || '1') - 1;
  return {
    yearStartMonth
  };
}

export function modelForDate(now, args) {
  now = toDate(now);
  args = args || {};

  const year = currentYearInterval(args.yearStartMonth || 0, now);

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
