export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "HingLearn",
  description:
    "AI, Machine Learning, Deep Learning, Computer Science, Research Papers aur Programming ko expert tutorials, notes aur interview prep se seekho.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.hinglearn.in",
  ogImage: "/og-default.png",
  links: {
    twitter: "https://twitter.com/hinglearn",
    github: "https://github.com/hinglearn",
    linkedin: "https://linkedin.com/company/hinglearn",
  },
  creator: "HingLearn Team",
} as const;

export type SiteConfig = typeof siteConfig;
