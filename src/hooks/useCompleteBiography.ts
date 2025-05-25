
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * Custom hook to handle biography completion logic
 * @returns Object containing complete biography function and loading state
 */
export const useCompleteBiography = () => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);

  /**
   * Updates the biography status to indicate questionnaire completion
   * @param biographyId The ID of the biography to complete
   * @param generateToc Whether to generate TOC immediately after completion
   */
  const completeBiography = async (biographyId: string, generateToc: boolean = true): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "Error",
        description: "Biography ID is required",
        variant: "destructive"
      });
      return;
    }
    
    // Validate biography ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(biographyId)) {
      toast({
        title: "Error",
        description: "Invalid biography ID format",
        variant: "destructive"
      });
      return;
    }
    
    setIsCompleting(true);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to complete a biography",
          variant: "destructive"
        });
        return;
      }

      // Verify the biography exists and belongs to the current user
      const { data: biography, error: biographyError } = await supabase
        .from("biographies")
        .select("id, user_id")
        .eq("id", biographyId)
        .eq("user_id", session.user.id)
        .maybeSingle();
        
      if (biographyError) {
        console.error("Error verifying biography:", biographyError);
        throw new Error("Error verifying biography access");
      }
      
      if (!biography) {
        throw new Error("Biography not found or you don't have permission to access it");
      }
      
      // Update biography status to indicate questionnaire completion
      const { error } = await supabase
        .from("biographies")
        .update({ 
          status: "QuestionnaireCompleted", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", biographyId)
        .eq("user_id", session.user.id);
        
      if (error) {
        throw error;
      }
      
      // Show success message
      toast({
        title: "Success",
        description: "Questionnaire completed successfully!",
      });
      
      // Generate TOC or navigate to dashboard
      if (generateToc) {
        try {
          console.log(`Generating TOC for biography: ${biographyId}`);
          const { error } = await supabase.functions.invoke("generate-toc", {
            body: { biographyId }
          });
          
          if (error) throw error;
          
          // Navigate to TOC page after successful generation
          navigate(`/biography/${biographyId}/toc`);
        } catch (error) {
          console.error("Error generating TOC:", error);
          toast({
            title: "Error",
            description: "Failed to generate table of contents, you can try again from the dashboard",
            variant: "destructive"
          });
          navigate(`/dashboard`);
        }
      } else {
        // Navigate to dashboard if not generating TOC
        navigate(`/dashboard`);
      }
      
    } catch (error) {
      console.error("Error updating biography status:", error);
      toast({
        title: "Error",
        description: "Failed to update biography status",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return { completeBiography, isCompleting };
};
