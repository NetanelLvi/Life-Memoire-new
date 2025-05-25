
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TOCData } from "@/types/biography";

/**
 * Hook to fetch TOC data for a biography
 */
export const useTOCQueries = (biographyId: string | undefined) => {
  // Fetch TOC data
  const {
    data: tocData,
    isLoading,
    error,
  } = useQuery<TOCData, Error>({
    queryKey: ["biography_toc", biographyId],
    queryFn: async () => {
      if (!biographyId) throw new Error("Biography ID is required");

      const { data, error } = await supabase
        .from("biography_toc")
        .select("*")
        .eq("biography_id", biographyId)
        .single();

      if (error) throw error;
      
      // Convert structure to TOCChapter[] with proper type casting
      return {
        ...data,
        structure: Array.isArray(data.structure) 
          ? (data.structure as any[]).map(item => ({
              title: item.title || '',
              description: item.description || ''
            }))
          : []
      } as TOCData;
    },
    enabled: !!biographyId,
    retry: 1,
  });

  return {
    tocData,
    isLoading,
    error,
    chapters: tocData?.structure || [],
  };
};
