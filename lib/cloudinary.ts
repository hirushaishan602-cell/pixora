// Every image on the site (project portfolio images, client request photos,
// chat attachments) is uploaded straight to Cloudinary from the browser
// using an unsigned upload preset — no Firebase Storage involved anywhere.

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

  if (!res.ok) {
    throw new Error("Cloudinary upload failed. Check the cloud name / upload preset.");
  }

  const data = await res.json();
  return data.secure_url as string;
}
