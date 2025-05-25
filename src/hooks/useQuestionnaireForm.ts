
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Question, Answer } from "@/types/questionnaire";
import { useNavigate } from "react-router-dom";
import { biographyAnswerSchema } from "@/utils/formValidation";
import { showErrorToast } from "@/utils/errorHandling";

interface UseQuestionnaireFormProps {
  questions: Question[];
  biographyId: string;
  answers: Record<string, Answer>;
  onSaveAnswer: (answer: Answer) => Promise<void>;
  onComplete: () => void;
}

export const useQuestionnaireForm = ({
  questions,
  biographyId,
  answers,
  onSaveAnswer,
  onComplete
}: UseQuestionnaireFormProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: {
      answer: "",
    },
    resolver: zodResolver(biographyAnswerSchema),
  });

  const currentQuestion = questions[currentQuestionIndex];

  // Update form values when current question or answers change
  useEffect(() => {
    if (currentQuestion && answers[currentQuestion.id]) {
      form.reset({
        answer: answers[currentQuestion.id]?.answer_text || "",
      });
    } else if (currentQuestion) {
      form.reset({
        answer: "",
      });
    }
  }, [currentQuestion, answers, form]);

  const handleSaveAnswer = async (data: { answer: string }) => {
    if (!currentQuestion) return;
    
    setIsSaving(true);
    
    try {
      const answer: Answer = {
        biography_id: biographyId,
        question_id: currentQuestion.id,
        answer_text: data.answer,
      };
      
      await onSaveAnswer(answer);
    } catch (error) {
      console.error("Error saving answer:", error);
      showErrorToast(error, "שגיאה בשמירת התשובה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    try {
      await form.handleSubmit(handleSaveAnswer)();
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // We're at the last question
        onComplete();
      }
    } catch (error) {
      showErrorToast(error, "שגיאה במעבר לשאלה הבאה");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await form.handleSubmit(handleSaveAnswer)();
      navigate(`/dashboard`);
    } catch (error) {
      showErrorToast(error, "שגיאה בשמירה ויציאה");
    }
  };
  
  const jumpToQuestion = async (index: number) => {
    if (index >= 0 && index < questions.length) {
      try {
        // Save the current answer before jumping
        await form.handleSubmit(handleSaveAnswer)();
        setCurrentQuestionIndex(index);
      } catch (error) {
        showErrorToast(error, "שגיאה במעבר לשאלה");
      }
    }
  };

  return {
    form,
    currentQuestion,
    currentQuestionIndex,
    isSaving,
    handleSaveAnswer,
    handleNext,
    handlePrevious,
    handleSaveAndExit,
    jumpToQuestion,
    totalQuestions: questions.length,
  };
};
