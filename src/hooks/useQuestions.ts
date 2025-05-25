
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/questionnaire";

/**
 * Custom hook to fetch biography questions
 * @returns Query object containing questions data, loading state, and error
 */
export const useQuestions = () => {
  return useQuery<Question[], Error>({
    queryKey: ["biography_questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biography_questions")
        .select("*")
        .order("question_order", { ascending: true });

      if (error) throw error;
      return data as Question[];
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - questions don't change often
  });
};
