
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Chapter } from "@/types/biography";

/**
 * Hook to fetch chapters for a biography
 */
export const useChapterQueries = (biographyId: string | undefined) => {
  // Fetch chapters for a biography
  const {
    data: chapters,
    isLoading,
    error,
    refetch
  } = useQuery<Chapter[], Error>({
    queryKey: ["biography_chapters", biographyId],
    queryFn: async () => {
      if (!biographyId) throw new Error("Biography ID is required");
      
      const { data, error } = await supabase
        .from("biography_chapters")
        .select("*")
        .eq("biography_id", biographyId)
        .order("chapter_order", { ascending: true });

      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!biographyId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    chapters,
    isLoading,
    error,
    refetch
  };
};
