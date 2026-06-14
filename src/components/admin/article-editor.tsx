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
import { Save, Upload, FileText, Settings, ImageIcon, Eye, Send, Trash2, ArrowLeft } from "lucide-react";
import { ArticleContent } from "@/components/articles/article-content";
import { canDeleteArticles } from "@/lib/roles";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const EMPTY_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

interface ArticleEditorProps {
  editSlug?: string | null;
  role?: string;
  onCancelEdit?: () => void;
  onSaved?: () => void;
}

export function ArticleEditor({
  editSlug = null,
  role = "",
  onCancelEdit,
  onSaved,
}: ArticleEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(editSlug);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [articleLoading, setArticleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: EMPTY_DOC,
    category: "",
    tags: "",
    featuredImage: "",
    sortOrder: 0,
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
          if (!isEditing && data.data.length > 0) {
            setForm((f) => ({
              ...f,
              category: f.category || data.data[0]._id,
            }));
          }
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, [isEditing]);

  useEffect(() => {
    if (!editSlug) {
      setOriginalSlug("");
      setForm({
        title: "",
        slug: "",
        excerpt: "",
        content: EMPTY_DOC,
        category: categories[0]?._id || "",
        tags: "",
        featuredImage: "",
        sortOrder: 0,
        status: "draft",
        isFeatured: false,
        isSponsored: false,
        metaTitle: "",
        metaDescription: "",
      });
      return;
    }

    setArticleLoading(true);
    fetch(`/api/articles/${editSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          alert(data.error || "Article load nahi ho paya");
          onCancelEdit?.();
          return;
        }

        const article = data.data.article;
        setOriginalSlug(article.slug);
        setForm({
          title: article.title || "",
          slug: article.slug || "",
          excerpt: article.excerpt || "",
          content: article.content || EMPTY_DOC,
          category: article.category?._id || article.category || "",
          tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
          featuredImage: article.featuredImage || "",
          sortOrder: article.sortOrder ?? 0,
          status: article.status || "draft",
          isFeatured: article.isFeatured || false,
          isSponsored: article.isSponsored || false,
          metaTitle: article.metaTitle || "",
          metaDescription: article.metaDescription || "",
        });
      })
      .catch(() => alert("Article load nahi ho paya"))
      .finally(() => setArticleLoading(false));
  }, [editSlug, categories, onCancelEdit]);

  const updateField = (field: string, value: string | boolean | number) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (!isEditing && field === "title" && typeof value === "string") {
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

  const buildPayload = (submitAs: typeof form.status) => ({
    ...form,
    status: submitAs,
    contentFormat: "richtext" as const,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sortOrder: Number(form.sortOrder) || 0,
    ...(submitAs === "in_review" ? { submittedAt: new Date() } : {}),
    ...(submitAs === "published" ? { publishedDate: new Date() } : {}),
  });

  const handleSubmit = async (
    e: React.FormEvent,
    submitAs: "draft" | "in_review" | "published" = "draft"
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/articles/${originalSlug}` : "/api/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(submitAs)),
      });
      const data = await res.json();

      if (data.success) {
        onSaved?.();
        if (!onSaved) {
          router.push("/admin");
          router.refresh();
        }
      } else {
        alert(data.error || "Save fail ho gaya");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !originalSlug) return;
    if (!confirm(`"${form.title}" permanently delete karna hai?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${originalSlug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onSaved?.();
        onCancelEdit?.();
      } else {
        alert(data.error || "Delete fail ho gaya");
      }
    } finally {
      setLoading(false);
    }
  };

  if (articleLoading) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Article load ho raha hai...
      </p>
    );
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, form.status as "draft" | "in_review" | "published")} className="space-y-6">
      {isEditing && (
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onCancelEdit} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Wapas list par
          </Button>
          <p className="text-sm text-muted-foreground">Article edit ho raha hai</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {isEditing ? "Edit Article" : "Content Editor"} — topic-wise category se linked
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
                <Label className="text-xs">Topic / Category</Label>
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
                <Label className="text-xs">Topic Order (GFG list mein position)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => updateField("sortOrder", parseInt(e.target.value, 10) || 0)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Chhota number = category page par upar dikhega
                </p>
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
                  onClick={(e) => handleSubmit(e as React.FormEvent, "draft")}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : isEditing ? "Update Draft" : "Save as Draft"}
                </Button>
                <Button
                  type="button"
                  disabled={loading || categories.length === 0}
                  onClick={(e) => handleSubmit(e as React.FormEvent, "in_review")}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button
                  type="button"
                  disabled={loading || categories.length === 0}
                  onClick={(e) => handleSubmit(e as React.FormEvent, "published")}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Publishing..." : isEditing ? "Update & Publish" : "Publish Now"}
                </Button>
                {isEditing && canDeleteArticles(role) && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={loading}
                    onClick={handleDelete}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Article
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
