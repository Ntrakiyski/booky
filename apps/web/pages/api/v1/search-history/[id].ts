import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/lib/api/verifyUser";
import { deleteSearchHistoryEntry } from "@/lib/api/controllers/searchHistory";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  const id = parseInt(req.query.id as string, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (req.method === "DELETE") {
    const { statusCode, ...data } = await deleteSearchHistoryEntry(user.id, id);
    return res.status(statusCode).json(data);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
