import { prisma } from "@linkwarden/prisma";

const MAX_SEARCH_HISTORY = 10;

export async function getSearchHistory(userId: number) {
  const history = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_SEARCH_HISTORY,
  });

  return {
    data: history,
    statusCode: 200,
    success: true,
  };
}

export async function addSearchHistory(userId: number, query: string) {
  if (!query || query.trim().length === 0) {
    return {
      data: null,
      statusCode: 400,
      success: false,
      message: "Query is required",
    };
  }

  const trimmedQuery = query.trim();

  // Check if same query already exists, if so update its timestamp
  const existing = await prisma.searchHistory.findFirst({
    where: {
      userId,
      query: trimmedQuery,
    },
  });

  if (existing) {
    const updated = await prisma.searchHistory.update({
      where: { id: existing.id },
      data: { createdAt: new Date() },
    });

    return {
      data: updated,
      statusCode: 200,
      success: true,
    };
  }

  // Count existing entries
  const count = await prisma.searchHistory.count({
    where: { userId },
  });

  // If at limit, delete oldest entry
  if (count >= MAX_SEARCH_HISTORY) {
    const oldest = await prisma.searchHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (oldest) {
      await prisma.searchHistory.delete({
        where: { id: oldest.id },
      });
    }
  }

  // Create new entry
  const newEntry = await prisma.searchHistory.create({
    data: {
      query: trimmedQuery,
      userId,
    },
  });

  return {
    data: newEntry,
    statusCode: 201,
    success: true,
  };
}

export async function deleteSearchHistoryEntry(userId: number, id: number) {
  const entry = await prisma.searchHistory.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!entry) {
    return {
      data: null,
      statusCode: 404,
      success: false,
      message: "Entry not found",
    };
  }

  await prisma.searchHistory.delete({
    where: { id },
  });

  return {
    data: null,
    statusCode: 200,
    success: true,
  };
}

export async function clearSearchHistory(userId: number) {
  await prisma.searchHistory.deleteMany({
    where: { userId },
  });

  return {
    data: null,
    statusCode: 200,
    success: true,
  };
}
