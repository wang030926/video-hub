import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure videos directory exists
const videosDir = path.join(__dirname, "public", "videos");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Serve video files statically
app.use("/videos", express.static(videosDir));

// Multer config: store uploaded videos in public/videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videosDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp4|webm|ogg|mov|avi|mkv|wmv|flv)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// Upload endpoint
app.post("/api/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video file provided" });
  }
  const video = {
    id: path.parse(req.file.filename).name,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    path: "/videos/" + req.file.filename,
    uploadedAt: new Date().toISOString(),
  };
  res.json(video);
});

// List all videos
app.get("/api/videos", (req, res) => {
  const files = fs.readdirSync(videosDir);
  const videos = files
    .filter((f) => /\.(mp4|webm|ogg|mov|avi|mkv|wmv|flv)$/i.test(f))
    .map((f) => {
      const stats = fs.statSync(path.join(videosDir, f));
      return {
        id: path.parse(f).name,
        filename: f,
        path: "/videos/" + f,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(videos);
});

// Delete a video
app.delete("/api/videos/:filename", (req, res) => {
  const filePath = path.join(videosDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Video not found" });
  }
});

app.listen(PORT, () => {
  console.log("Video server running on http://localhost:" + PORT);
});
