import { formatDistanceToNowStrict } from "date-fns";

export default function distanceToNow(dateTime: Date) {
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date provided to distanceToNow:", dateTime);
    return "Date not available";
  }

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
  });
}
