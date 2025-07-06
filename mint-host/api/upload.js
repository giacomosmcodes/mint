import { put } from "@vercel/blob";
import formidable from "formidable";
import crypto from "crypto";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ maxFileSize: 750 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Upload error: " + err.message });

    if (!files.file) return res.status(400).json({ error: "No file uploaded" });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fs = await import("fs/promises");
    const buffer = await fs.readFile(file.filepath);

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    const filename = req.headers["mint-filename"] || file.originalFilename || hash;

    try {
      const { url } = await put(`uploads/${hash}`, buffer, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log(`[INFO] Uploaded file ${filename} as hash ${hash}`);
      return res.status(200).json({ url, hash, filename });
    } catch (e) {
      console.error("[ERROR] Upload failed:", e);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
