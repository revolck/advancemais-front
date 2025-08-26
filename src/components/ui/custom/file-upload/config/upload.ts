import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const raw = typeof req.query.path === "string" ? req.query.path : "";
    const safe = raw.replace(/\.+/g, "").replace(/^\/+/g, "");
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads", safe);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await new Promise<void>((resolve) => {
      upload.single("file")(req as any, res as any, (err: any) => {
        if (err) {
          res.status(500).json({ error: "Upload failed" });
          return resolve();
        }
        const file = (req as any).file;
        const raw = typeof req.query.path === "string" ? req.query.path : "";
        const safe = raw.replace(/\.+/g, "").replace(/^\/+/g, "");
        const relative = `/images/uploads${safe ? "/" + safe : ""}/${file.filename}`;
        res.status(200).json({ url: relative });
        resolve();
      });
    });
    return;
  }

  if (req.method === "DELETE") {
    const raw = typeof req.query.file === "string" ? req.query.file : "";
    const safe = raw.replace(/^\/+/g, "");
    if (!safe) {
      res.status(400).json({ error: "File path is required" });
      return;
    }
    const filePath = path.join(process.cwd(), "public", safe);
    fs.unlink(filePath, (err) => {
      if (err) {
        res.status(500).json({ error: "Delete failed" });
        return;
      }
      res.status(204).end();
    });
    return;
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
