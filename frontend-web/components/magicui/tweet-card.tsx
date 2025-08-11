"use client";

// Lightweight placeholder TweetCard for demo usage without external deps
import * as React from "react";
import { cn } from "@/lib/utils";

export function TweetCard({ id, className }: { id: string; className?: string }) {
  return (
    <article className={cn("rounded-xl border bg-card p-4 text-sm", className)}>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-neutral-200" />
        <div>
          <div className="font-semibold leading-tight">Magic UI</div>
          <div className="text-muted-foreground leading-tight">@magicui • demo</div>
        </div>
      </div>
      <p className="mt-3">
        Embedded tweet demo (id: <span className="font-mono">{id}</span>).
        Replace this with React Tweet or Magic UI pro implementation when ready.
      </p>
    </article>
  );
}

export function ClientTweetCard({ id, className }: { id: string; className?: string }) {
  return <TweetCard id={id} className={className} />;
}


