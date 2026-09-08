// Every image on the site (project portfolio images, client request photos,
// chat attachments, hero artwork) is uploaded straight to Cloudinary from
// the browser using an unsigned upload preset — no Firebase Storage needed.

const CLOUDINARY_CLOUD_NAME = "drf1c9d3o";
const CLOUDINARY_UPLOAD_PRESET = "pixora";

export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  let data: { secure_url?: string; error?: { message?: string } };
  try {
    data = await res.json();
  } catch {
    throw new Error("Cloudinary returned an invalid response.");
  }

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary image upload failed.");
  }

  return data.secure_url;
}
