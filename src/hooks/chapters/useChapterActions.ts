
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Chapter } from "@/types/biography";
import { useChapterMutations } from "./useChapterMutations";

/**
 * Hook that provides higher-level chapter operations
 */
export const useChapterActions = (biographyId: string | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  const { 
    saveChapterMutation,
    createChapterMutation,
    reorderChaptersMutation
  } = useChapterMutations(biographyId);

  // Optimized save function
  const saveChapter = async (chapter: Partial<Chapter> & { id: string }): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveChapterMutation.mutateAsync(chapter);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new chapter function
  const createChapter = async (chapterData: Omit<Chapter, "id" | "created_at" | "updated_at">): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createChapterMutation.mutateAsync(chapterData);
    } finally {
      setIsSaving(false);
    }
  };

  const reorderChapters = async (orderedIds: string[]): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await reorderChaptersMutation.mutateAsync(orderedIds);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveChapter,
    createChapter,
    reorderChapters
  };
};
