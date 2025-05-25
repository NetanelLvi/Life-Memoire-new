
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { extractErrorMessage } from "@/utils/errorHandling";
import { retry } from "@/utils/errorHandler";

/**
 * Custom hook to generate TOC for a biography
 * @returns Object containing generate function and loading state
 */
export const useTOCGenerate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTOC = async (biographyId: string): Promise<void> => {
    if (!biographyId) {
      toast({
        title: "שגיאה",
        description: "נדרש מזהה ביוגרפיה",
        variant: "destructive"
      });
      return;
    }

    // Validate biography ID format before sending to edge function
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(biographyId)) {
      toast({
        title: "שגיאה",
        description: "מזהה הביוגרפיה אינו בפורמט תקין",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מידע על המשתמש, נדרשת התחברות",
          variant: "destructive"
        });
        return;
      }

      // First verify that the biography exists and belongs to the current user
      console.log(`Verifying biography ID: ${biographyId}`);
      const { data: biography, error: biographyError } = await supabase
        .from("biographies")
        .select("id, title")
        .eq("id", biographyId)
        .eq("user_id", session.user.id)
        .maybeSingle();
        
      if (biographyError) {
        console.error("Error verifying biography:", biographyError);
        throw new Error("שגיאה באימות הביוגרפיה");
      }
      
      if (!biography) {
        console.error("Biography not found for current user");
        throw new Error("הביוגרפיה אינה קיימת או שאינך מורשה לגשת אליה");
      }
      
      console.log(`Found biography: ${biography.title} (${biography.id})`);

      // Check if there are any answers for this biography
      const { data: answers, error: answersError } = await supabase
        .from("biography_answers")
        .select("id, answer_text")
        .eq("biography_id", biographyId);
        
      if (answersError) {
        console.error("Error checking for answers:", answersError);
        throw answersError;
      }
      
      // Check if there are any answers with content
      const answersWithContent = answers?.filter(a => a.answer_text?.trim()) || [];
      
      if (!answers || answers.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו תשובות לביוגרפיה זו. אנא ענה על לפחות שאלה אחת.",
          variant: "destructive"
        });
        return;
      }

      if (answersWithContent.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו תשובות עם תוכן לביוגרפיה זו. אנא הוסף תוכן לפחות לתשובה אחת.",
          variant: "destructive"
        });
        return;
      }

      console.log(`Invoking generate-toc with biography ID: ${biographyId}`);
      console.log(`Found ${answersWithContent.length} answers with content out of ${answers.length} total answers`);

      // Generate the TOC using the edge function with retry logic
      const { data, error } = await retry(
        () => supabase.functions.invoke("generate-toc", {
          body: { biographyId }
        }),
        {
          retries: 2,
          delay: 1000,
          onRetry: (attempt, err) => {
            console.log(`Retry attempt ${attempt} after error:`, err);
          }
        }
      );

      if (error) {
        console.error("Edge function invocation error:", error);
        throw new Error(`Edge function error: ${extractErrorMessage(error)}`);
      }

      if (!data) {
        console.error("No data returned from edge function");
        throw new Error("No data returned from edge function");
      }

      if (data?.error) {
        console.error("TOC generation error:", data.error);
        
        // Handle specific error codes
        if (data.code === "NO_ANSWERS" || data.code === "EMPTY_ANSWERS") {
          throw new Error("לא נמצאו תשובות מספיקות ליצירת תוכן העניינים. אנא ענה על יותר שאלות.");
        } else if (data.code === "MISSING_API_KEY") {
          throw new Error("מפתח ה-API של OpenAI אינו מוגדר במערכת.");
        } else if (data.code === "OPENAI_API_ERROR") {
          throw new Error("שגיאה בשירות ה-AI. אנא נסה שוב מאוחר יותר.");
        } else {
          throw new Error(data.error);
        }
      }

      toast({
        title: "הצלחה",
        description: "תוכן העניינים נוצר בהצלחה",
      });

      // Navigate to the TOC page
      window.location.href = `/biography/${biographyId}/toc`;

    } catch (error) {
      console.error("Error generating TOC:", error);
      let errorMessage = "נכשל ביצירת תוכן העניינים";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateTOC, isGenerating, error };
};
