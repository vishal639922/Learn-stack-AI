import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin" | "subadmin" | "editor" | "author";
  avatar?: string;
  bookmarks: mongoose.Types.ObjectId[];
  readingHistory: {
    articleId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  isPremium: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["user", "admin", "subadmin", "editor", "author"],
      default: "user",
    },
    avatar: { type: String },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    readingHistory: [
      {
        articleId: { type: Schema.Types.ObjectId, ref: "Article" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isPremium: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
