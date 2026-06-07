"use client";

import { Share2, Link2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const url = `${siteConfig.url}/articles/${slug}`;

  const shareLinks = [
    {
      name: "Twitter",
      icon: Share2,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      icon: Share2,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.name} par share karo`}
        >
          <Button variant="outline" size="icon" className="h-8 w-8">
            <link.icon className="h-4 w-4" />
          </Button>
        </a>
      ))}
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyLink}>
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
