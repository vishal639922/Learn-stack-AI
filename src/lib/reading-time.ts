import readingTime from "reading-time";

export function calculateReadingTime(content: string): {
  text: string;
  minutes: number;
} {
  const stats = readingTime(content);
  return {
    text: stats.text,
    minutes: Math.ceil(stats.minutes),
  };
}
