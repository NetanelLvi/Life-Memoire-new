
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Answer } from "@/types/questionnaire";
import { handleApiError, showErrorToast, showSuccessToast } from "@/utils/errorHandling";

/**
 * Custom hook to manage questionnaire answers for a biography
 * @param biographyId The ID of the biography
 */
export const useQuestionnaireAnswers = (biographyId: string | undefined) => {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const queryClient = useQueryClient();

  // Fetch existing answers for this biography
  const { data: existingAnswers, isLoading, error } = useQuery({
    queryKey: ["biography_answers", biographyId],
    queryFn: async () => {
      if (!biographyId) throw new Error("No biography ID provided");
      
      const { data, error } = await supabase
        .from("biography_answers")
        .select("*")
        .eq("biography_id", biographyId);

      if (error) throw error;
      return data as Answer[];
    },
    enabled: !!biographyId,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Update an answer
  const saveAnswerMutation = useMutation({
    mutationFn: async (answer: Answer) => {
      const { data, error } = await supabase
        .from("biography_answers")
        .upsert({ ...answer }, { onConflict: "biography_id,question_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update local state with new answer
      setAnswers((prev) => ({
        ...prev,
        [data.question_id]: data,
      }));
      
      // Invalidate related queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ["biography_answers", biographyId] });
      
      showSuccessToast("התשובה נשמרה בהצלחה");
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      showErrorToast(errorMessage, "שגיאה בשמירת התשובה");
    }
  });

  // Process existing answers into a map for easy access
  useEffect(() => {
    if (existingAnswers) {
      const answersMap = existingAnswers.reduce((acc, answer) => {
        acc[answer.question_id] = answer;
        return acc;
      }, {} as Record<string, Answer>);
      
      setAnswers(answersMap);
    }
  }, [existingAnswers]);

  // Count answered questions
  const answeredCount = existingAnswers?.filter(a => a.answer_text?.trim())?.length || 0;

  return {
    answers,
    answeredCount,
    isLoading,
    error,
    saveAnswer: async (answer: Answer) => await saveAnswerMutation.mutateAsync(answer),
  };
};
