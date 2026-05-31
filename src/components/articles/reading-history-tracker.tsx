"use client";

import { useEffect } from "react";

interface ReadingHistoryTrackerProps {
  articleId: string;
}

export function ReadingHistoryTracker({ articleId }: ReadingHistoryTrackerProps) {
  useEffect(() => {
    fetch("/api/users/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    }).catch(() => {});
  }, [articleId]);

  return null;
}
