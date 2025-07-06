export default async function handler(req, res) {
  if (req.method !== "GET") {
    console.warn("[WARN] User made request with unsupported method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { hash } = req.query;

  if (!hash || !/^[a-f0-9]{64}$/.test(hash)) {
    console.warn("[WARN] User made request with invalid hash:", hash);
    return res.status(400).json({ error: "Invalid hash" });
  }

  const userId = "lybibhkvzry2ntzk.public"; // REPLACE WITH YOUR USER ID
  const blobUrl = `https://${userId}.blob.vercel-storage.com/uploads/${hash}?download=1`;

  res.writeHead(302, { Location: blobUrl });
  res.end();
}
