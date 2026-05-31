export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "LearnStack AI",
  description:
    "Master AI, Machine Learning, Deep Learning, Computer Science, Research Papers, and Programming with expert tutorials, notes, and interview prep.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-default.png",
  links: {
    twitter: "https://twitter.com/learnstackai",
    github: "https://github.com/learnstackai",
    linkedin: "https://linkedin.com/company/learnstackai",
  },
  creator: "LearnStack AI Team",
} as const;

export type SiteConfig = typeof siteConfig;
