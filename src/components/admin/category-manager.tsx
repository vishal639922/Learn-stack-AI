"use client";

import { useState, useEffect } from "react";
import slugify from "slugify";
import { Plus, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/categories/category-icon";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  articleCount?: number;
}

const ICON_OPTIONS = [
  "Brain", "Cpu", "Network", "BarChart3", "Globe", "Monitor",
  "Database", "Layers", "Code2", "FileText", "Target", "BookOpen",
];

const COLOR_OPTIONS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-red-500 to-orange-600",
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "BookOpen",
    color: COLOR_OPTIONS[0],
  });

  const loadCategories = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
        else setError(data.error || "Categories load nahi ho payi");
      })
      .catch(() => setError("Categories load nahi ho payi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: slugify(name, { lower: true, strict: true }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setForm({
          name: "",
          slug: "",
          description: "",
          icon: "BookOpen",
          color: COLOR_OPTIONS[0],
        });
        loadCategories();
      } else {
        setError(data.error || "Category create fail ho gaya");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Is category ko delete karna hai?")) return;

    const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) loadCategories();
    else alert(data.error || "Delete fail ho gaya");
  };

  if (loading) {
    return <p className="text-muted-foreground text-center py-8">Categories load ho rahi hain...</p>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nayi Category Banao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
            )}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Data Structures"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Category ka short description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <select
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>{color.replace("from-", "").split(" ")[0]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${form.color} flex items-center justify-center`}>
                <CategoryIcon name={form.icon} className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">{form.name || "Preview"}</p>
                <p className="text-xs text-muted-foreground">{form.slug || "slug"}</p>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Save ho raha hai..." : "Category Add Karo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4" /> Saari Categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y max-h-[520px] overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color || "from-primary to-primary/70"} flex items-center justify-center shrink-0`}>
                  <CategoryIcon name={cat.icon} className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    /{cat.slug} · {cat.articleCount || 0} articles
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleDelete(cat.slug)}
                  disabled={(cat.articleCount || 0) > 0}
                  title={(cat.articleCount || 0) > 0 ? "Pehle articles hatao" : "Delete"}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="p-6 text-center text-muted-foreground text-sm">Koi category nahi hai</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
