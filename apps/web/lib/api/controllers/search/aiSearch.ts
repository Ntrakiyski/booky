import { prisma } from "@linkwarden/prisma";
import {
  getAIModel,
  isAIConfigured,
  aiSearchPrompt,
  LinkForSearch,
} from "@linkwarden/lib";
import { generateText } from "ai";

interface AISearchParams {
  query: string;
  userId: number;
}

export default async function aiSearch({ query, userId }: AISearchParams) {
  if (!isAIConfigured()) {
    return {
      data: null,
      statusCode: 503,
      success: false,
      message: "AI search is not configured. Please set up an AI provider.",
    };
  }

  if (!query || query.trim().length === 0) {
    return {
      data: null,
      statusCode: 400,
      success: false,
      message: "Search query is required.",
    };
  }

  try {
    const links = await prisma.link.findMany({
      where: {
        collection: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: { userId },
              },
            },
          ],
        },
      },
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        tags: {
          select: { name: true },
        },
        collection: {
          select: { name: true },
        },
      },
      take: 200,
      orderBy: { id: "desc" },
    });

    if (links.length === 0) {
      return {
        data: { links: [], collections: [], tags: [] },
        statusCode: 200,
        success: true,
        message: "No bookmarks found.",
      };
    }

    const linksForPrompt: LinkForSearch[] = links.map((link) => ({
      id: link.id,
      name: link.name,
      url: link.url,
      description: link.description,
      tags: link.tags.map((t) => t.name),
      collectionName: link.collection?.name,
    }));

    const prompt = aiSearchPrompt(query, linksForPrompt);

    const { text } = await generateText({
      model: getAIModel(),
      prompt,
    });

    let matchedIds: number[] = [];
    try {
      const cleanedText = text.trim().replace(/^```json?\s*|\s*```$/g, "");
      matchedIds = JSON.parse(cleanedText);
      if (!Array.isArray(matchedIds)) {
        matchedIds = [];
      }
    } catch {
      console.log("Failed to parse AI search response:", text);
      matchedIds = [];
    }

    if (matchedIds.length === 0) {
      return {
        data: { links: [], collections: [], tags: [] },
        statusCode: 200,
        success: true,
        message: "No matching bookmarks found.",
      };
    }

    const matchedLinks = await prisma.link.findMany({
      where: {
        id: { in: matchedIds },
        collection: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: { userId },
              },
            },
          ],
        },
      },
      omit: {
        textContent: true,
      },
      include: {
        tags: true,
        collection: true,
        pinnedBy: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    const sortedLinks = matchedIds
      .map((id) => matchedLinks.find((link) => link.id === id))
      .filter(Boolean);

    // Separate pinned links from regular links
    const pinnedLinks = sortedLinks.filter(
      (link) => link && link.pinnedBy && link.pinnedBy.length > 0
    );
    const regularLinks = sortedLinks.filter(
      (link) => link && (!link.pinnedBy || link.pinnedBy.length === 0)
    );

    // Get unique collection IDs from matched links
    const collectionIds = Array.from(
      new Set(sortedLinks.map((link) => link?.collectionId).filter(Boolean))
    );

    // Fetch matching collections
    const matchedCollections =
      collectionIds.length > 0
        ? await prisma.collection.findMany({
            where: {
              id: { in: collectionIds as number[] },
            },
            include: {
              _count: {
                select: { links: true },
              },
            },
          })
        : [];

    // Get unique tag IDs from matched links
    const tagIds = Array.from(
      new Set(
        sortedLinks.flatMap((link) => link?.tags?.map((t) => t.id) || [])
      )
    );

    // Fetch matching tags
    const matchedTags =
      tagIds.length > 0
        ? await prisma.tag.findMany({
            where: {
              id: { in: tagIds },
              ownerId: userId,
            },
            include: {
              _count: {
                select: { links: true },
              },
            },
          })
        : [];

    return {
      data: {
        links: regularLinks,
        pins: pinnedLinks,
        collections: matchedCollections,
        tags: matchedTags,
      },
      counts: {
        links: regularLinks.length,
        pins: pinnedLinks.length,
        collections: matchedCollections.length,
        tags: matchedTags.length,
      },
      statusCode: 200,
      success: true,
      message: "Success",
    };
  } catch (error) {
    console.error("AI search error:", error);
    return {
      data: null,
      statusCode: 500,
      success: false,
      message: "AI search failed. Please try again.",
    };
  }
}
