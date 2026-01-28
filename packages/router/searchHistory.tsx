import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MobileAuth } from "@linkwarden/types";

export interface SearchHistoryEntry {
  id: number;
  query: string;
  createdAt: string;
}

const useSearchHistory = (
  auth?: MobileAuth
): UseQueryResult<SearchHistoryEntry[], Error> => {
  let status: "loading" | "authenticated" | "unauthenticated";

  if (!auth) {
    const session = useSession();
    status = session.status;
  } else {
    status = auth?.status;
  }

  return useQuery({
    queryKey: ["searchHistory"],
    queryFn: async () => {
      const response = await fetch(
        (auth?.instance ? auth?.instance : "") + "/api/v1/search-history",
        auth?.session
          ? {
              headers: {
                Authorization: `Bearer ${auth.session}`,
              },
            }
          : undefined
      );
      if (!response.ok) throw new Error("Failed to fetch search history.");

      const data = await response.json();
      return data.data;
    },
    enabled: status === "authenticated",
  });
};

const useAddSearchHistory = (auth?: MobileAuth) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(
        (auth?.instance ? auth?.instance : "") + "/api/v1/search-history",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(auth?.session
              ? { Authorization: `Bearer ${auth.session}` }
              : {}),
          },
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
    },
  });
};

const useDeleteSearchHistoryEntry = (auth?: MobileAuth) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(
        (auth?.instance ? auth?.instance : "") + `/api/v1/search-history/${id}`,
        {
          method: "DELETE",
          headers: {
            ...(auth?.session
              ? { Authorization: `Bearer ${auth.session}` }
              : {}),
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        ["searchHistory"],
        (oldData: SearchHistoryEntry[] | undefined) =>
          oldData?.filter((entry) => entry.id !== deletedId) ?? []
      );
    },
  });
};

const useClearSearchHistory = (auth?: MobileAuth) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        (auth?.instance ? auth?.instance : "") + "/api/v1/search-history",
        {
          method: "DELETE",
          headers: {
            ...(auth?.session
              ? { Authorization: `Bearer ${auth.session}` }
              : {}),
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(["searchHistory"], []);
    },
  });
};

export {
  useSearchHistory,
  useAddSearchHistory,
  useDeleteSearchHistoryEntry,
  useClearSearchHistory,
};
