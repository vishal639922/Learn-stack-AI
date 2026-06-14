"use client";

import { useState, useEffect } from "react";
import { Check, X, MessageSquare, Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  author: { name: string; email: string };
  submittedAt?: string;
  reviewedAt?: string;
  reviewComment?: string;
  reviewedBy?: { name: string };
}

export function ArticleReviewManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles?status=in_review&limit=50");
      const data = await res.json();
      if (data.success) {
        setArticles(data.data.articles || []);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: "approve" | "reject" | "request_revision") => {
    if (!selectedArticle) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/articles/${selectedArticle.slug}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewComment }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedArticle(null);
        setReviewComment("");
        fetchArticles();
      } else {
        alert(data.error || "Review failed");
      }
    } catch (error) {
      alert("Review failed");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      in_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      published: "bg-blue-100 text-blue-800",
      archived: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100"}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Articles load ho rahe hain...
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Article</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedArticle(null);
                setReviewComment("");
              }}
            >
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">{selectedArticle.title}</h3>
            <p className="text-muted-foreground mb-4">{selectedArticle.excerpt}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedArticle.author.name}</span>
              </div>
              {selectedArticle.submittedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Submitted: {formatDate(selectedArticle.submittedAt)}</span>
                </div>
              )}
              {selectedArticle.reviewedBy && (
                <div className="flex items-center gap-2">
                  <span>Reviewed by: {selectedArticle.reviewedBy.name}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Review Actions</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Comment (optional)
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleReview("approve")}
                  disabled={actionLoading}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview("request_revision")}
                  disabled={actionLoading}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Request Revision
                </Button>
                <Button
                  onClick={() => handleReview("reject")}
                  disabled={actionLoading}
                  variant="destructive"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(`/articles/${selectedArticle.slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          </div>

          {selectedArticle.reviewComment && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Previous Review Comment</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedArticle.reviewComment}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Review ({articles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Koi article review ke liye pending nahi hai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article._id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(article.status)}
                    <span className="text-sm text-muted-foreground">
                      by {article.author.name}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{article.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                  {article.submittedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted: {formatDate(article.submittedAt)}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedArticle(article)}
                  className="ml-4"
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
