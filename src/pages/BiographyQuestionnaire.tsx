
import { useParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import QuestionnaireProgress from "@/components/questionnaire/QuestionnaireProgress";
import QuestionnaireLoading from "@/components/questionnaire/QuestionnaireLoading";
import QuestionnaireNotFound from "@/components/questionnaire/QuestionnaireNotFound";
import QuestionnaireHeader from "@/components/questionnaire/QuestionnaireHeader";
import { useBiography } from "@/hooks/useBiography";
import { useQuestions } from "@/hooks/useQuestions";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";
import { useCompleteBiography } from "@/hooks/useCompleteBiography";
import { Answer } from "@/types/questionnaire";
import { useTOCGenerate } from "@/hooks/useTOCGenerate";
import { Button } from "@/components/ui/button";
import { BookText } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const BiographyQuestionnaire = () => {
  const { biographyId } = useParams<{ biographyId: string }>();
  const [isGeneratingTOC, setIsGeneratingTOC] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Custom hooks to fetch and manage data
  const { data: biography, isLoading: biographyLoading, error: biographyError } = useBiography(biographyId);
  const { data: questions, isLoading: questionsLoading } = useQuestions();
  const { answers, answeredCount, isLoading: answersLoading, saveAnswer } = useQuestionnaireAnswers(biographyId);
  const { completeBiography } = useCompleteBiography();
  const { generateTOC, isGenerating, error: tocError } = useTOCGenerate();
  const { isKeyConfigured, isChecking, error: keyError } = useGeminiApiKey();

  // Check if data is still loading
  const isLoading = biographyLoading || questionsLoading || answersLoading || isChecking;
  
  // Check if there's at least one answer with content
  const hasAnswerWithContent = Object.values(answers).some(answer => answer.answer_text?.trim());
  
  // Validate biographyId format
  useEffect(() => {
    if (biographyId && !biographyLoading && !biographyError && !biography) {
      toast({
        title: "שגיאה",
        description: "הביוגרפיה המבוקשת לא נמצאה",
        variant: "destructive"
      });
    }
  }, [biographyId, biography, biographyLoading, biographyError]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return <QuestionnaireLoading />;
  }

  // Show error state if biography is not found
  if (!biography) {
    return <QuestionnaireNotFound />;
  }

  // Function to handle saving an answer
  const handleSaveAnswer = async (answer: Answer) => {
    await saveAnswer(answer);
  };

  // Function to handle completing the questionnaire
  const handleComplete = async () => {
    if (biographyId) {
      try {
        await completeBiography(biographyId);
      } catch (error) {
        console.error("Error completing biography:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעת השלמת השאלון",
          variant: "destructive"
        });
      }
    }
  };

  // Function to handle generating TOC
  const handleGenerateTOC = async () => {
    if (!biographyId) {
      const errorMsg = "מזהה ביוגרפיה חסר";
      setGenerationError(errorMsg);
      toast({
        title: "שגיאה",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    // Check if we have any answers with content
    if (!hasAnswerWithContent) {
      const errorMsg = "יש לענות על לפחות שאלה אחת לפני יצירת תוכן העניינים";
      setGenerationError(errorMsg);
      toast({
        title: "לא ניתן ליצור תוכן עניינים",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    if (!isKeyConfigured) {
      const errorMsg = "מפתח ה-API של OpenAI לא מוגדר במערכת. אנא פנה למנהל המערכת.";
      setGenerationError(errorMsg);
      toast({
        title: "מפתח API חסר",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingTOC(true);
    setGenerationError(null);
    
    try {
      console.log(`Generating TOC for biography: ${biographyId}`);
      await generateTOC(biographyId);
    } catch (error) {
      if (error instanceof Error) {
        setGenerationError(error.message);
      } else {
        setGenerationError("אירעה שגיאה לא צפויה בעת יצירת תוכן העניינים");
      }
    } finally {
      setIsGeneratingTOC(false);
    }
  };

  // Combine all potential errors
  const hasError = keyError || tocError || generationError;

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <QuestionnaireHeader title={biography.title} />
        
        {!isKeyConfigured && !isChecking && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>אין מפתח API לשירות OpenAI</AlertTitle>
            <AlertDescription>
              מפתח ה-API של OpenAI אינו מוגדר במערכת. לא ניתן ליצור תוכן עניינים אוטומטי.
              אנא פנה למנהל המערכת כדי להגדיר את המפתח.
            </AlertDescription>
          </Alert>
        )}
        
        {hasError && (
          <div className="mb-6">
            <ErrorDisplay
              title="שגיאה בעת יצירת תוכן העניינים"
              message={hasError}
              variant="card"
            />
          </div>
        )}
        
        {questions && questions.length > 0 && (
          <>
            <QuestionnaireProgress 
              questions={questions} 
              answeredCount={answeredCount} 
            />
            
            <div className="flex justify-end mb-6">
              <Button 
                variant="outline"
                className="flex items-center gap-2" 
                onClick={handleGenerateTOC}
                disabled={isGeneratingTOC || !hasAnswerWithContent || isGenerating || !isKeyConfigured}
              >
                {isGeneratingTOC || isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    מייצר תוכן עניינים...
                  </>
                ) : (
                  <>
                    <BookText className="h-4 w-4" />
                    צור תוכן עניינים
                  </>
                )}
              </Button>
            </div>
            
            <QuestionnaireForm
              questions={questions}
              biographyId={biographyId || ''}
              answers={answers}
              onSaveAnswer={handleSaveAnswer}
              onComplete={handleComplete}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BiographyQuestionnaire;
