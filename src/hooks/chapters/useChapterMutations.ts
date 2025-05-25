
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Chapter } from "@/types/biography";
import { extractErrorMessage } from "@/utils/errorHandling";

/**
 * Hook providing mutations for chapter operations
 */
export const useChapterMutations = (biographyId: string | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Save or update a chapter
  const saveChapterMutation = useMutation({
    mutationFn: async (chapter: Partial<Chapter> & { id: string }): Promise<Chapter> => {
      const { data, error } = await supabase
        .from("biography_chapters")
        .update({
          title: chapter.title,
          content: chapter.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chapter.id)
        .select("*")
        .single();

      if (error) throw error;
      return data as Chapter;
    },
    onSuccess: (updatedChapter) => {
      // Update the cache with the new chapter data
      queryClient.setQueryData<Chapter[]>(
        ["biography_chapters", biographyId],
        (oldData) => {
          if (!oldData) return [updatedChapter];
          
          return oldData.map(chapter => 
            chapter.id === updatedChapter.id ? updatedChapter : chapter
          );
        }
      );
      
      toast({
        title: "Success",
        description: "Chapter saved successfully",
      });
    },
    onError: (error) => {
      const errorMessage = extractErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to save chapter: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  // Create a new chapter
  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: Omit<Chapter, "id" | "created_at" | "updated_at">): Promise<Chapter> => {
      // Make sure biographyId exists and is a string before using it
      if (!biographyId) {
        throw new Error("Biography ID is required");
      }
      
      const { data, error } = await supabase
        .from("biography_chapters")
        .insert({
          biography_id: biographyId,
          title: chapterData.title,
          content: chapterData.content,
          chapter_order: chapterData.chapter_order,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data as Chapter;
    },
    onSuccess: (newChapter) => {
      // Update cache with the new chapter
      queryClient.setQueryData<Chapter[]>(
        ["biography_chapters", biographyId],
        (oldData) => {
          if (!oldData) return [newChapter];
          return [...oldData, newChapter];
        }
      );
      
      toast({
        title: "Success",
        description: "New chapter created",
      });
    },
    onError: (error) => {
      const errorMessage = extractErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to create chapter: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  // Reorder chapters
  const reorderChaptersMutation = useMutation({
    mutationFn: async (orderedIds: string[]): Promise<void> => {
      // Create an array of updates, one for each chapter
      const updates = orderedIds.map((id, index) => ({
        id, 
        chapter_order: index
      }));
      
      // Update each chapter's order
      for (const update of updates) {
        const { error } = await supabase
          .from("biography_chapters")
          .update({ chapter_order: update.chapter_order })
          .eq("id", update.id);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get the updated order
      queryClient.invalidateQueries({ queryKey: ["biography_chapters", biographyId] });
      
      toast({
        title: "Success",
        description: "Chapter order updated",
      });
    },
    onError: (error) => {
      const errorMessage = extractErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to update chapter order: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  return {
    isSaving,
    setIsSaving,
    saveChapterMutation,
    createChapterMutation,
    reorderChaptersMutation
  };
};
