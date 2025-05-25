
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Biography } from "@/types/biography";

/**
 * Custom hook to fetch a single biography by ID
 * @param biographyId The ID of the biography to fetch
 */
export const useBiography = (biographyId: string | undefined) => {
  return useQuery<Biography, Error>({
    queryKey: ["biography", biographyId],
    queryFn: async () => {
      if (!biographyId) throw new Error("No biography ID provided");
      
      const { data, error } = await supabase
        .from("biographies")
        .select("*")
        .eq("id", biographyId)
        .single();

      if (error) throw error;
      return data as Biography;
    },
    enabled: !!biographyId,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
