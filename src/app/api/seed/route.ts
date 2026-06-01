import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { User } from "@/models/User";
import { DEFAULT_CATEGORIES } from "@/config/categories";
import { calculateReadingTime } from "@/lib/reading-time";
import { apiResponse, apiError, withRateLimit } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "auth");
  if (rateLimitError) return rateLimitError;

  const secret = request.headers.get("x-seed-secret");
  if (secret !== process.env.AUTH_SECRET) {
    return apiError("Unauthorized", 401);
  }

  try {
    await connectDB();

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
    if (mlCategory) {
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
Supervised learning uses labeled data to train models. Common algorithms include:
- Linear Regression
- Decision Trees
- Support Vector Machines
- Neural Networks

\`\`\`python
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
\`\`\`

### 2. Unsupervised Learning
Unsupervised learning finds patterns in unlabeled data:
- K-Means Clustering
- PCA (Principal Component Analysis)
- Autoencoders

### 3. Reinforcement Learning
Agents learn by interacting with an environment and receiving rewards or penalties.

## Key Concepts
- **Features**: Input variables used for prediction
- **Labels**: Target variables in supervised learning
- **Training/Testing Split**: Dividing data for model evaluation
- **Overfitting**: When a model memorizes training data

Start your ML journey today!`,
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

Neural networks are the foundation of deep learning, inspired by biological neurons.

## Architecture
A neural network consists of:
1. **Input Layer** - Receives raw data
2. **Hidden Layers** - Process and transform data
3. **Output Layer** - Produces predictions

## Activation Functions
- **ReLU**: \`f(x) = max(0, x)\`
- **Sigmoid**: \`f(x) = 1 / (1 + e^(-x))\`
- **Softmax**: Used for multi-class classification

## Backpropagation
The algorithm that computes gradients and updates weights using the chain rule of calculus.

\`\`\`python
import torch
import torch.nn as nn

class SimpleNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        )
    
    def forward(self, x):
        return self.layers(x)
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
          { ...article, readingTime: minutes, views: Math.floor(Math.random() * 5000) + 100 },
          { upsert: true, returnDocument: "after" }
        );
      }

      await Category.findByIdAndUpdate(mlCategory._id, { articleCount: 2 });
    }

    return apiResponse({ seeded: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error(error);
    return apiError("Seed failed", 500);
  }
}
