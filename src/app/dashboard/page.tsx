import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard, type ArticleCardData } from "@/components/articles/article-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, History, User as UserIcon } from "lucide-react";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Dashboard",
  description: "Your personal learning dashboard.",
  slug: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.user.id)
    .populate({
      path: "bookmarks",
      populate: [
        { path: "author", select: "name avatar" },
        { path: "category", select: "name slug" },
      ],
    })
    .populate({
      path: "readingHistory.articleId",
      populate: [
        { path: "author", select: "name avatar" },
        { path: "category", select: "name slug" },
      ],
    })
    .lean();

  if (!user) redirect("/login");

  const bookmarks = (user.bookmarks || []) as unknown as ArticleCardData[];
  const history = (user.readingHistory || [])
    .map((h) => h.articleId as unknown as ArticleCardData)
    .filter((a) => a && a.slug) as ArticleCardData[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xl">
            {user.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">{user.role}</Badge>
            {user.isPremium && <Badge>Premium</Badge>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="bookmarks">
        <TabsList>
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="h-4 w-4" /> Saved ({bookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> History ({history.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" /> Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="mt-6">
          {bookmarks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No saved articles yet.{" "}
              <Link href="/articles" className="text-primary hover:underline">
                Browse articles
              </Link>
            </p>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {history.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No reading history yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="max-w-md space-y-4 p-6 border rounded-lg">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Member since</label>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
