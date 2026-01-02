import express from "express";
import { Storage } from "@google-cloud/storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Increased limit for high-res site photos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Initialize GCS - The bucket is assumed to exist for performance
const storage = new Storage();
const bucketName = 'aaraa-erp-assets';

const publicDir = fs.existsSync(path.join(__dirname, 'dist')) 
  ? path.join(__dirname, 'dist') 
  : __dirname;

app.use(express.static(publicDir));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    bucket: bucketName,
    environment: fs.existsSync(path.join(__dirname, 'dist')) ? 'production' : 'development'
  });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided in request." });
  }

  const targetPath = req.body.path || `uploads/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(targetPath);

  // Use resumable: false for standard site artifacts to reduce overhead
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: req.file.mimetype,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  });

  let hasResponded = false;

  blobStream.on("error", (err) => {
    console.error("GCS Stream Error:", err);
    if (!hasResponded) {
      hasResponded = true;
      res.status(500).json({ error: `Cloud Storage Link Failure: ${err.message}` });
    }
  });

  blobStream.on("finish", () => {
    if (!hasResponded) {
      hasResponded = true;
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      res.json({
        success: true,
        path: `gs://${bucketName}/${blob.name}`,
        url: publicUrl
      });
    }
  });

  // End stream with buffer
  blobStream.end(req.file.buffer);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AARAA ERP Gateway: Serving from ${publicDir} on port ${PORT}`);
});