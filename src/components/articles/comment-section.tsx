"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: { name: string; avatar?: string };
}

interface CommentSectionProps {
  articleId: string;
  initialComments?: Comment[];
  isLoggedIn: boolean;
}

export function CommentSection({
  articleId,
  initialComments = [],
  isLoggedIn,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, content }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={loading || !content.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground mb-8 p-4 bg-muted rounded-lg">
          Please <a href="/login" className="text-primary underline">login</a> to leave a comment.
        </p>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.userId?.avatar} />
              <AvatarFallback>
                {comment.userId?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.userId?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
