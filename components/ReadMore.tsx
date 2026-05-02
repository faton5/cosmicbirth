"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const CHAR_LIMIT = 600;

export function ReadMore({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("result");

  if (text.length <= CHAR_LIMIT) {
    return <p className="text-muted-foreground leading-relaxed">{text}</p>;
  }

  return (
    <div>
      <p className="text-muted-foreground leading-relaxed">
        {expanded ? text : text.slice(0, CHAR_LIMIT) + "..."}
      </p>
      <Button
        variant="link"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 h-auto p-0 text-primary"
      >
        {expanded ? t("readLess") : t("readMore")}
      </Button>
    </div>
  );
}
