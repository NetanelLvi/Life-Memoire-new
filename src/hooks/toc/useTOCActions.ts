
import { useState } from "react";
import { useTOCMutations } from "./useTOCMutations";
import { TOCChapter } from "@/types/biography";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BiographyStatus } from "@/types/biography";

/**
 * Higher-level actions for TOC management
 */
export const useTOCActions = (biographyId: string | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { updateTOC } = useTOCMutations(biographyId);

  const saveTOC = async (structure: TOCChapter[]): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateTOC.mutateAsync({ structure });
    } finally {
      setIsSaving(false);
    }
  };

  const approveAndContinue = async (structure: TOCChapter[]): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // First update and approve the TOC
      await updateTOC.mutateAsync({
        structure,
        approved: true,
      });

      // Then create chapter records for each TOC entry
      try {
        // First, check if chapters already exist to avoid duplicates
        const { data: existingChapters } = await supabase
          .from("biography_chapters")
          .select("id")
          .eq("biography_id", biographyId);

        // Only create chapters if none exist yet
        if (!existingChapters || existingChapters.length === 0) {
          // Create chapters based on the TOC structure
          const chaptersToInsert = structure.map((chapter, index) => ({
            biography_id: biographyId,
            title: chapter.title,
            content: chapter.description,
            chapter_order: index,
          }));

          const { error: chaptersError } = await supabase
            .from("biography_chapters")
            .insert(chaptersToInsert);

          if (chaptersError) {
            console.error("Error creating chapters:", chaptersError);
            toast({
              title: "Warning",
              description: "Table of contents approved, but there was an error creating chapters",
              variant: "destructive",
            });
          }
        }
        
        // Update biography status to TOCApproved
        await supabase
          .from("biographies")
          .update({
            status: BiographyStatus.TOCApproved,
            updated_at: new Date().toISOString()
          })
          .eq("id", biographyId);
        
      } catch (error) {
        console.error("Error managing chapters:", error);
      }

      // Navigate to the editor
      navigate(`/biography/${biographyId}/editor`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveTOC,
    approveAndContinue,
  };
};
