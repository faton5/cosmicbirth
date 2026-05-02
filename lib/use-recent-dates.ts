"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cosmicbirth-recent-dates";
const MAX_DATES = 8;

export function useRecentDates() {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDates(JSON.parse(stored));
    } catch {
      // localStorage not available
    }
  }, []);

  return dates;
}

export function addRecentDate(date: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dates: string[] = stored ? JSON.parse(stored) : [];
    dates = [date, ...dates.filter((d) => d !== date)].slice(0, MAX_DATES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch {
    // localStorage not available
  }
}
