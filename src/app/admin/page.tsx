"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Plus,
  BarChart3,
  Eye,
  TrendingUp,
  Palette,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleEditor } from "@/components/admin/article-editor";
import { ArticleListManager } from "@/components/admin/article-list-manager";
import { CategoryManager } from "@/components/admin/category-manager";
import { UserManager } from "@/components/admin/user-manager";
import { ThemeSettings } from "@/components/admin/theme-settings";
import { ArticleReviewManager } from "@/components/admin/article-review-manager";
import {
  canManageCategories,
  canManageUsers,
  canManageTheme,
  canCreateArticles,
  canEditAnyArticle,
  canViewAnalytics,
  canReviewArticles,
} from "@/lib/roles";

interface Analytics {
  overview: {
    totalUsers: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalComments: number;
    totalCategories: number;
    newsletterSubscribers: number;
    totalViews: number;
  };
  topArticles: { title: string; slug: string; views: number }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role || "";

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (canViewAnalytics(role)) {
      fetch("/api/admin/analytics")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setAnalytics(data.data);
          setLoading(false);
        });
    } else {
      setLoading(false);
      if (canCreateArticles(role)) setActiveTab("create");
    }
  }, [role, status]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Admin panel load ho raha hai...
      </div>
    );
  }

  const stats = analytics?.overview;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            {role && (
              <p className="text-xs text-muted-foreground capitalize">{role} account</p>
            )}
          </div>
        </div>
        {canCreateArticles(role) && (
          <Button
            onClick={() => {
              setEditingSlug(null);
              setActiveTab("create");
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Naya Article
          </Button>
        )}
      </div>

      {stats && canViewAnalytics(role) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users },
            { label: "Published", value: stats.publishedArticles, icon: FileText },
            { label: "Total Views", value: stats.totalViews, icon: Eye },
            { label: "Subscribers", value: stats.newsletterSubscribers, icon: TrendingUp },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className="h-8 w-8 text-primary opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {canViewAnalytics(role) && (
            <TabsTrigger value="overview">Overview</TabsTrigger>
          )}
          {canCreateArticles(role) && (
            <TabsTrigger value="create">
              {editingSlug ? "Edit Article" : "Article Banao"}
            </TabsTrigger>
          )}
          {canEditAnyArticle(role) && (
            <TabsTrigger value="manage">Manage Articles</TabsTrigger>
          )}
          {canReviewArticles(role) && (
            <TabsTrigger value="review">Review Articles</TabsTrigger>
          )}
          {canManageCategories(role) && (
            <TabsTrigger value="categories">Categories</TabsTrigger>
          )}
          {canManageUsers(role) && (
            <TabsTrigger value="users">Users</TabsTrigger>
          )}
          {canManageTheme(role) && (
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          )}
        </TabsList>

        {canViewAnalytics(role) && (
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Top Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.topArticles?.map((article, i) => (
                    <div key={article.slug} className="flex justify-between py-2 border-b last:border-0">
                      <Link href={`/articles/${article.slug}`} className="text-sm hover:text-primary truncate flex-1">
                        {i + 1}. {article.title}
                      </Link>
                      <span className="text-xs text-muted-foreground ml-2">{article.views} views</span>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">Koi data nahi</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" /> Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Draft Articles</span><span>{stats?.draftArticles}</span></div>
                  <div className="flex justify-between"><span>Total Comments</span><span>{stats?.totalComments}</span></div>
                  <div className="flex justify-between"><span>Categories</span><span>{stats?.totalCategories}</span></div>
                  <div className="flex justify-between"><span>Total Articles</span><span>{stats?.totalArticles}</span></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {canCreateArticles(role) && (
          <TabsContent value="create" className="mt-6">
            <ArticleEditor
              editSlug={editingSlug}
              role={role}
              onCancelEdit={() => {
                setEditingSlug(null);
                setActiveTab(canEditAnyArticle(role) ? "manage" : "create");
              }}
              onSaved={() => {
                setEditingSlug(null);
                setActiveTab(canEditAnyArticle(role) ? "manage" : "create");
              }}
            />
          </TabsContent>
        )}

        {canEditAnyArticle(role) && (
          <TabsContent value="manage" className="mt-6">
            <ArticleListManager
              role={role}
              onEdit={(slug) => {
                setEditingSlug(slug);
                setActiveTab("create");
              }}
            />
          </TabsContent>
        )}

        {canReviewArticles(role) && (
          <TabsContent value="review" className="mt-6">
            <ArticleReviewManager />
          </TabsContent>
        )}

        {canManageCategories(role) && (
          <TabsContent value="categories" className="mt-6">
            <CategoryManager />
          </TabsContent>
        )}

        {canManageUsers(role) && (
          <TabsContent value="users" className="mt-6">
            <UserManager actorRole={role} />
          </TabsContent>
        )}

        {canManageTheme(role) && (
          <TabsContent value="appearance" className="mt-6">
            <ThemeSettings />
          </TabsContent>
        )}
      </Tabs>

      {!canViewAnalytics(role) && canCreateArticles(role) && activeTab === "overview" && (
        <div className="mt-6 text-center text-muted-foreground">
          <p>Article likhne ke liye <strong>Article Banao</strong> tab kholo.</p>
        </div>
      )}
    </div>
  );
}
