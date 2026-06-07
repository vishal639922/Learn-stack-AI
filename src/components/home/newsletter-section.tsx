"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 bg-primary/5 border-y">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          AI & Tech mein aage raho
        </h2>
        <p className="text-muted-foreground mb-6">
          Har hafte tutorials, research paper summaries aur interview prep seedha apke inbox mein.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span>Subscribe karne ke liye dhanyavaad!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Apna email daalo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Subscribe ho raha hai..." : "Subscribe"}
            </Button>
          </form>
        )}

        {status === "error" && (
          <p className="text-destructive text-sm mt-2">Kuch galat ho gaya. Phir se try karo.</p>
        )}
      </div>
    </section>
  );
}
