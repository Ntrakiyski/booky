import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/lib/api/verifyUser";
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from "@/lib/api/controllers/searchHistory";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method === "GET") {
    const { statusCode, ...data } = await getSearchHistory(user.id);
    return res.status(statusCode).json(data);
  }

  if (req.method === "POST") {
    const { query } = req.body;
    const { statusCode, ...data } = await addSearchHistory(user.id, query);
    return res.status(statusCode).json(data);
  }

  if (req.method === "DELETE") {
    const { statusCode, ...data } = await clearSearchHistory(user.id);
    return res.status(statusCode).json(data);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
