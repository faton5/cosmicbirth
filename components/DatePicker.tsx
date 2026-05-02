"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const APOD_START = new Date("1995-06-16");

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function DatePicker() {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");
  const dateLocale = locale === "fr" ? fr : enUS;

  function handleSelect(selected: Date | undefined) {
    if (!selected) return;
    setDate(selected);
    setOpen(false);

    const formatted = format(selected, "yyyy-MM-dd");
    router.push(`/${locale}/result/${formatted}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "w-72 justify-start text-left font-normal inline-flex shrink-0 items-center rounded-lg border border-border bg-background text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground px-2.5 h-8 gap-1.5",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date
          ? format(date, "PPP", { locale: dateLocale })
          : t("datePlaceholder")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(d) => d < APOD_START || d > getYesterday()}
          defaultMonth={date || new Date(2000, 0)}
          fromDate={APOD_START}
          toDate={getYesterday()}
          locale={dateLocale}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
