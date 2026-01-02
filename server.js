import express from "express";
import { Storage } from "@google-cloud/storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize GCS
const storage = new Storage();
const bucketName = 'aaraa-erp-assets';

// Determine public directory (dist for production, root for dev)
const publicDir = fs.existsSync(path.join(__dirname, 'dist')) 
  ? path.join(__dirname, 'dist') 
  : __dirname;

app.use(express.static(publicDir));

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    bucket: bucketName,
    environment: fs.existsSync(path.join(__dirname, 'dist')) ? 'production' : 'development'
  });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  let streamEnded = false;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bucket = storage.bucket(bucketName);
    
    try {
      const [exists] = await bucket.exists();
      if (!exists) {
        return res.status(404).json({ error: `Bucket '${bucketName}' not found.` });
      }
    } catch (e) {
      return res.status(500).json({ error: "Cloud Storage Access Denied. Check IAM permissions." });
    }

    const targetPath = req.body.path || `uploads/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
    const blob = bucket.file(targetPath);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
      timeout: 30000 
    });

    blobStream.on("error", (err) => {
      if (streamEnded) return;
      streamEnded = true;
      res.status(500).json({ error: `Cloud Write Failure: ${err.message}` });
    });

    blobStream.on("finish", () => {
      if (streamEnded) return;
      streamEnded = true;
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      res.json({
        success: true,
        path: `gs://${bucketName}/${blob.name}`,
        url: publicUrl
      });
    });

    blobStream.end(req.file.buffer);

  } catch (err) {
    if (!streamEnded) {
      res.status(500).json({ error: err.message });
    }
  }
});

// Handle SPA routing - always serve index.html for non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AARAA ERP Server active on port ${PORT}`);
  console.log(`Serving from: ${publicDir}`);
});