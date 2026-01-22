import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure storage directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Use the filename from the request body if provided
    const filename = req.body.filename || `${Date.now()}_${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload
 * Upload a product image
 */
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return the file information
    res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/products/${req.file.filename}`,
      url: `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

/**
 * GET /api/upload/list
 * List all uploaded files
 */
router.get("/list", (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const fileList = files.map((filename) => {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        path: `/uploads/products/${filename}`,
        url: `${req.protocol}://${req.get("host")}/uploads/products/${filename}`,
        size: stats.size,
        created: stats.birthtime,
      };
    });

    res.json({
      success: true,
      files: fileList,
      count: fileList.length,
    });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

/**
 * GET /api/upload/:filename
 * Get information about a specific file
 */
router.get("/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const stats = fs.statSync(filePath);
    res.json({
      success: true,
      filename,
      path: `/uploads/products/${filename}`,
      url: `${req.protocol}://${req.get("host")}/uploads/products/${filename}`,
      size: stats.size,
      created: stats.birthtime,
    });
  } catch (error) {
    console.error("File info error:", error);
    res.status(500).json({ error: "Failed to get file info" });
  }
});

/**
 * DELETE /api/upload/:filename
 * Delete a specific file
 */
router.delete("/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
