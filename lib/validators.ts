const APOD_START_DATE = "1995-06-16";

export function isValidApodDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr + "T00:00:00Z");
  if (isNaN(date.getTime())) return false;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  if (`${year}-${month}-${day}` !== dateStr) return false;

  const minDate = new Date(APOD_START_DATE + "T00:00:00Z");
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  return date >= minDate && date <= yesterday;
}

export function getApodMinDate(): string {
  return APOD_START_DATE;
}

export function getApodMaxDate(): string {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return yesterday.toISOString().split("T")[0];
}
