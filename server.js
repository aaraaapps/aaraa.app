
import express from "express";
import { Storage } from "@google-cloud/storage";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize GCS - If running on GCP, it uses service account automatically
const storage = new Storage();
const bucketName = 'aaraa-erp-assets';

app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", bucket: bucketName });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  let streamEnded = false;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`Uplink Request: ${req.file.originalname} to ${bucketName}`);

    const bucket = storage.bucket(bucketName);
    
    // Check bucket access early
    try {
      const [exists] = await bucket.exists();
      if (!exists) {
        return res.status(404).json({ error: `Bucket '${bucketName}' not found.` });
      }
    } catch (e) {
      console.error("Bucket Access Error:", e);
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
      console.error("GCS Write Stream Error:", err);
      res.status(500).json({ error: `Cloud Write Failure: ${err.message}` });
    });

    blobStream.on("finish", () => {
      if (streamEnded) return;
      streamEnded = true;
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      console.log(`Uplink Success: ${publicUrl}`);
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
    console.error("Internal Upload Error:", err);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AARAA ERP Server active on port ${PORT}`);
  console.log(`Targeting Bucket: ${bucketName}`);
});
