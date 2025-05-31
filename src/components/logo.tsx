
"use client";

import { BotMessageSquare } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 mb-8">
      <BotMessageSquare className="h-10 w-10 text-primary" />
      <h1 className="text-4xl font-headline text-gradient-messiah">
        MeSSiahX – <span className="opacity-80">CognitiveMapper</span>
      </h1>
    </div>
  );
}
