import type { NextApiRequest, NextApiResponse } from "next";
import aiSearch from "@/lib/api/controllers/search/aiSearch";
import verifyUser from "@/lib/api/verifyUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method === "POST") {
    const { query } = req.body;

    const { statusCode, ...data } = await aiSearch({
      query,
      userId: user.id,
    });

    return res.status(statusCode).json(data);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
