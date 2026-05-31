import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function getOptimizedImageUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
) {
  const { width = 800, height, crop = "fill" } = options;
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    fetch_format: "auto",
    quality: "auto",
  });
}

export async function uploadImage(
  file: string,
  folder = "learnstack/articles"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}
