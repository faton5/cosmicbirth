"use client";

import { useEffect, useState } from "react";

type AnimatedScoreProps = {
  score: number;
  labelText: string;
  scoreLabel: string;
};

export function AnimatedScore({ score, labelText, scoreLabel }: AnimatedScoreProps) {
  const [current, setCurrent] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), score));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (current / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-4 transition-all duration-1000 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <p className="text-label-caps uppercase tracking-widest text-on-surface-variant font-heading">
        {scoreLabel}
      </p>

      <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl" />
        <svg className="relative h-full w-full -rotate-90 drop-shadow-[0_0_20px_rgba(208,188,255,0.6)]" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-variant opacity-30"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl sm:text-7xl font-heading font-bold bg-gradient-to-br from-white to-primary-fixed bg-clip-text text-transparent">
            {current}%
          </span>
        </div>
      </div>

      <p className="text-h3 font-heading text-gradient">{labelText}</p>
    </div>
  );
}
