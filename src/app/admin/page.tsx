"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Plus,
  BarChart3,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleEditor } from "@/components/admin/article-editor";

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
  recentUsers: { name: string; email: string; role: string; createdAt: string }[];
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<Analytics["recentUsers"]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([analyticsRes, usersRes]) => {
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (usersRes.success) setUsers(usersRes.data.users);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading admin panel...
      </div>
    );
  }

  const stats = analytics?.overview;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <Button onClick={() => setActiveTab("create")}>
          <Plus className="h-4 w-4 mr-2" /> New Article
        </Button>
      </div>

      {stats && (
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

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
                )) || <p className="text-muted-foreground text-sm">No data</p>}
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

        <TabsContent value="create" className="mt-6">
          <ArticleEditor />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} className="border-b last:border-0">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{user.role}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
