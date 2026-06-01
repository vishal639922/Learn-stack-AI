import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { User } from "@/models/User";
import { DEFAULT_CATEGORIES } from "@/config/categories";
import { calculateReadingTime } from "@/lib/reading-time";

let seeded = false;

export async function ensureDevSeed() {
  if (seeded || process.env.NODE_ENV !== "development") return;
  seeded = true;

  try {
    await connectDB();

    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) return;

    console.log("[seed] Populating development database...");

    for (const cat of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { ...cat, articleCount: 0 },
        { upsert: true, returnDocument: "after" }
      );
    }

    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        role: "admin",
      });
    }

    const mlCategory = await Category.findOne({ slug: "machine-learning" });
    if (!mlCategory) return;

    const sampleArticles = [
      {
        title: "Introduction to Machine Learning",
        slug: "introduction-to-machine-learning",
        excerpt:
          "Learn the fundamentals of machine learning, including supervised and unsupervised learning paradigms.",
        content: `# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### 1. Supervised Learning
Supervised learning uses labeled data to train models.

\`\`\`python
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
\`\`\`

### 2. Unsupervised Learning
Finds patterns in unlabeled data.

### 3. Reinforcement Learning
Agents learn by interacting with an environment.`,
        category: mlCategory._id,
        tags: ["machine-learning", "beginner", "python"],
        author: admin._id,
        status: "published" as const,
        isFeatured: true,
        publishedDate: new Date(),
      },
      {
        title: "Understanding Neural Networks",
        slug: "understanding-neural-networks",
        excerpt:
          "Deep dive into neural network architecture, activation functions, and backpropagation.",
        content: `# Understanding Neural Networks

Neural networks are the foundation of deep learning.

## Architecture
- **Input Layer** - Receives raw data
- **Hidden Layers** - Process and transform data
- **Output Layer** - Produces predictions

\`\`\`python
import torch.nn as nn
model = nn.Sequential(nn.Linear(784, 128), nn.ReLU(), nn.Linear(128, 10))
\`\`\``,
        category: mlCategory._id,
        tags: ["deep-learning", "neural-networks", "pytorch"],
        author: admin._id,
        status: "published" as const,
        isFeatured: true,
        publishedDate: new Date(Date.now() - 86400000),
      },
    ];

    for (const article of sampleArticles) {
      const { minutes } = calculateReadingTime(article.content);
      await Article.findOneAndUpdate(
        { slug: article.slug },
        {
          ...article,
          readingTime: minutes,
          views: Math.floor(Math.random() * 5000) + 100,
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    await Category.findByIdAndUpdate(mlCategory._id, { articleCount: 2 });
    console.log("[seed] Development database ready.");
  } catch (error) {
    console.error("[seed] Failed to seed development database:", error);
  }
}
