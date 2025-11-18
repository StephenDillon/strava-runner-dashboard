export function getLastFullWeek(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - daysToLastSunday);
  lastSunday.setHours(0, 0, 0, 0);
  return lastSunday;
}

export function getWeekStartDate(weeksBack: number, endDate: Date): Date {
  const date = new Date(endDate);
  date.setDate(date.getDate() - (weeksBack * 7));
  return date;
}

export function formatWeekLabel(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

export function formatWeekTooltip(date: Date): string {
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(startDate.getDate() + 6);
  
  const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

export function getWeeksBack(count: number, endDate: Date): Date[] {
  const weeks: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    weeks.push(getWeekStartDate(i, endDate));
  }
  return weeks;
}
