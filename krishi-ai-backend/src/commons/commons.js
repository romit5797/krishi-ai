import moment from "moment";

export const monthsArr = [
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
];
/**
 * This function rounds a number to specified decimal places.
 * Decimal places default to 2
 * @param {number} number
 * @param {number} decimalPlaces
 * @return {number} roundedNumber
 */
export function roundNumber(number, decimalPlaces = 2) {
  const offset = 10 ** decimalPlaces;
  const roundedValue = Math.round((number + Number.EPSILON) * offset) / offset;

  return roundedValue;
}

export const getBillingDates = (
  firstStartedOn,
  activatedOn,
  renewalOn,
  duration
) => {
  const first_term_start = new Date(firstStartedOn);
  const first_date = first_term_start.getDate();
  const prev_term_end = new Date(renewalOn);
  const prev_date = prev_term_end.getDate();
  // <--- Get diff in days --->
  const diff = first_date - prev_date;
  // <--- Check if job is being retried --->
  const isRetry = moment(prev_term_end).diff(moment(), "d") > 1 ? true : false;
  const date = isRetry ? new Date(activatedOn) : prev_term_end;
  const current_term_start = date;
  const next_cycle = moment(date).add(duration, "M");
  const current_term_end = next_cycle.add(diff, "d");
  return { current_term_start, current_term_end };
};
