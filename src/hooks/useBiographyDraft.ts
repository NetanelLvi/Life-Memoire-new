
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { transformDraftData } from "@/lib/validation";

/**
 * Hook for managing biography draft generation and retrieval
 */
export const useBiographyDraft = (biographyId?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Query to get draft info
  const draftQuery = useQuery({
    queryKey: ["biography-draft", biographyId],
    queryFn: async () => {
      if (!biographyId) throw new Error("Biography ID is required");

      const { data, error } = await supabase
        .from("biography_drafts")
        .select("*")
        .eq("biography_id", biographyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // If no data is found, return null directly
      if (!data) {
        return null;
      }

      // Validate and transform the data
      const validatedData = transformDraftData(data);
      if (!validatedData) {
        // If data is malformed, throw an error
        throw new Error("Invalid draft data received from server");
      }
      
      return validatedData;
    },
    enabled: !!biographyId,
    retry: 1,
  });

  // Mutation to generate a new draft
  const generateDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke("generate-biography-draft", {
          body: { biographyId: id }
        });

        if (error) throw error;
        
        // The Edge Function returns a summary, not the full draft.
        // The draft will be fetched by the draftQuery after invalidation.
        return data; // Return the summary data
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Draft Generated",
        description: "Your biography draft was generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["biography-draft", biographyId] });
      queryClient.invalidateQueries({ queryKey: ["biography", biographyId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to generate draft: ${error?.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Function to generate a new draft
  const generateDraft = async () => {
    console.log("generateDraft called in useBiographyDraft.ts with biographyId:", biographyId);
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is required",
        variant: "destructive",
      });
      return;
    }

    return generateDraftMutation.mutateAsync(biographyId);
  };

  return {
    draft: draftQuery.data,
    isLoading: draftQuery.isLoading,
    error: draftQuery.error,
    generateDraft,
    isGenerating,
    refetchDraft: () => queryClient.invalidateQueries({ queryKey: ["biography-draft", biographyId] }),
  };
};
