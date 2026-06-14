"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Save, Upload, FileText, Settings, ImageIcon, Eye, Send } from "lucide-react";
import { ArticleContent } from "@/components/articles/article-content";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const EMPTY_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function ArticleEditor() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: EMPTY_DOC,
    category: "",
    tags: "",
    featuredImage: "",
    status: "draft" as "draft" | "in_review" | "approved" | "rejected" | "published" | "archived",
    isFeatured: false,
    isSponsored: false,
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setForm((f) => ({
              ...f,
              category: f.category || data.data[0]._id,
            }));
          }
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && typeof value === "string") {
        updated.slug = slugify(value, { lower: true, strict: true });
      }
      return updated;
    });
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "hinglearn/articles");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) {
      updateField("featuredImage", data.data.url);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent, submitAs: "draft" | "in_review" | "published" = "draft") => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: submitAs,
          contentFormat: "richtext",
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          ...(submitAs === "in_review" ? { submittedAt: new Date() } : {}),
          ...(submitAs === "published" ? { publishedDate: new Date() } : {}),
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/admin`);
        router.refresh();
      } else {
        alert(data.error || "Article banane mein fail ho gaya");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, form.status as "draft" | "in_review" | "published")} className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main editor column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Editor — GeeksforGeeks style formatting
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Edit Mode" : "Preview"}
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Article title likho..."
              className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0"
              required
            />
          </div>

          {showPreview ? (
            <Card className="p-6">
              <h1 className="text-3xl font-bold mb-4">{form.title || "Article Title"}</h1>
              <p className="text-muted-foreground mb-6">{form.excerpt || "Article excerpt..."}</p>
              {form.featuredImage && (
                <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                  <Image
                    src={form.featuredImage}
                    alt="Featured"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <ArticleContent
                content={form.content}
                contentFormat="richtext"
              />
            </Card>
          ) : (
            <TiptapEditor
              content={form.content}
              onChange={(json) => updateField("content", json)}
            />
          )}
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Article Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => updateField("excerpt", e.target.value)}
                  rows={3}
                  required
                  placeholder="Short summary jo article card par dikhega..."
                  className="text-sm"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                {categoriesLoading ? (
                  <p className="text-xs text-muted-foreground">Categories load ho rahi hain...</p>
                ) : categories.length === 0 ? (
                  <p className="text-xs text-destructive">
                    Pehle Admin panel se ek category banao, phir article save karo.
                  </p>
                ) : (
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  placeholder="dsa, python, interview"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Featured Image
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="text-sm"
                />
                {form.featuredImage && (
                  <div className="relative h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={form.featuredImage}
                      alt="Featured"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">SEO Title</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  maxLength={70}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">SEO Description</Label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  maxLength={160}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => updateField("isFeatured", e.target.checked)}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isSponsored}
                    onChange={(e) => updateField("isSponsored", e.target.checked)}
                  />
                  Sponsored
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  disabled={loading || categories.length === 0}
                  onClick={(e) => handleSubmit(e as any, "draft")}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save as Draft"}
                </Button>
                <Button
                  type="button"
                  disabled={loading || categories.length === 0}
                  onClick={(e) => handleSubmit(e as any, "in_review")}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button
                  type="button"
                  disabled={loading || categories.length === 0}
                  onClick={(e) => handleSubmit(e as any, "published")}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Publishing..." : "Publish Now"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Editor Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Code Block</strong> — syntax highlighted code</li>
                <li><strong>Image</strong> — inline images upload</li>
                <li><strong>Diagram</strong> — flowcharts/diagrams as image</li>
                <li><strong>MCQ</strong> — practice questions with answers</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
