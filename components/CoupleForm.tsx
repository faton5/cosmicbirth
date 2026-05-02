"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { CalendarIcon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function CoupleForm() {
  const [date1, setDate1] = useState<Date>();
  const [date2, setDate2] = useState<Date>();
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");
  const dateLocale = locale === "fr" ? fr : enUS;

  function handleSubmit() {
    if (!date1 || !date2) return;
    const d1 = format(date1, "yyyy-MM-dd");
    const d2 = format(date2, "yyyy-MM-dd");
    router.push(`/${locale}/result/couple/${d1}/${d2}`);
  }

  const disabledDays = (d: Date) => d < APOD_START || d > getYesterday();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Popover open={open1} onOpenChange={setOpen1}>
          <PopoverTrigger
            className={cn(
              "w-64 justify-start text-left font-normal inline-flex shrink-0 items-center rounded-lg border border-border bg-background text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground px-2.5 h-8 gap-1.5",
              !date1 && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date1
              ? format(date1, "PPP", { locale: dateLocale })
              : t("date1Placeholder")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date1}
              onSelect={(d) => {
                setDate1(d);
                setOpen1(false);
              }}
              disabled={disabledDays}
              defaultMonth={new Date(2000, 0)}
              fromDate={APOD_START}
              toDate={getYesterday()}
              locale={dateLocale}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>

        <Heart className="h-6 w-6 text-primary" />

        <Popover open={open2} onOpenChange={setOpen2}>
          <PopoverTrigger
            className={cn(
              "w-64 justify-start text-left font-normal inline-flex shrink-0 items-center rounded-lg border border-border bg-background text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground px-2.5 h-8 gap-1.5",
              !date2 && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date2
              ? format(date2, "PPP", { locale: dateLocale })
              : t("date2Placeholder")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date2}
              onSelect={(d) => {
                setDate2(d);
                setOpen2(false);
              }}
              disabled={disabledDays}
              defaultMonth={new Date(2000, 0)}
              fromDate={APOD_START}
              toDate={getYesterday()}
              locale={dateLocale}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!date1 || !date2}
        size="lg"
        className="mt-2"
      >
        <Heart className="mr-2 h-4 w-4" />
        {t("coupleSubmit")}
      </Button>
    </div>
  );
}
