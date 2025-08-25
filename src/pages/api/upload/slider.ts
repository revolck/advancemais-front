import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { mkdirSync } from "fs";
import { join } from "path";

const uploadDir = join(process.cwd(), "public/imagens/slider");
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });
const uploadMiddleware = upload.single("file");

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (...args: any[]) => void) {
  return new Promise<void>((resolve, reject) => {
    fn(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await runMiddleware(req, res, uploadMiddleware);
    const file = (req as any).file as Express.Multer.File;
    const url = `/imagens/slider/${file.filename}`;
    res.status(200).json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Upload failed" });
  }
}
