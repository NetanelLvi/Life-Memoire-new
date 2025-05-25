
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TOCChapter } from "@/types/biography";

/**
 * Hook to provide TOC mutation operations
 */
export const useTOCMutations = (biographyId: string | undefined) => {
  const queryClient = useQueryClient();

  // Update TOC structure and approval status
  const updateTOC = useMutation({
    mutationFn: async ({
      structure,
      approved,
    }: {
      structure?: TOCChapter[];
      approved?: boolean;
    }) => {
      if (!biographyId) throw new Error("Biography ID is required");

      const updates: any = { updated_at: new Date().toISOString() };
      if (structure !== undefined) updates.structure = structure;
      if (approved !== undefined) updates.approved = approved;

      const { error } = await supabase
        .from("biography_toc")
        .update(updates)
        .eq("biography_id", biographyId)
        .select()
        .single();

      if (error) throw error;

      if (approved) {
        // Update biography progress if approving TOC - change from 'chapters' to 'editor'
        await supabase
          .from("biographies")
          .update({
            progress: "editor",
            status: "TOCApproved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", biographyId);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biography_toc", biographyId] });
      queryClient.invalidateQueries({ queryKey: ["biographies"] });
      toast({
        title: "Success",
        description: "Table of contents updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating TOC:", error);
      toast({
        title: "Error",
        description: "Failed to update table of contents",
        variant: "destructive",
      });
    },
  });

  return {
    updateTOC,
  };
};
