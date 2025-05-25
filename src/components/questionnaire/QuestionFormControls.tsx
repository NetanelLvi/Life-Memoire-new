
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionFormControlsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  isSaving: boolean;
}

const QuestionFormControls = ({
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  isSaving,
}: QuestionFormControlsProps) => {
  return (
    <div className="flex justify-between pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
      >
        <ChevronRight className="ml-2 h-4 w-4" />
        שאלה קודמת
      </Button>
      
      <div className="flex space-x-2">
        <Button
          type="submit"
          variant="outline"
          disabled={isSaving}
          className="ml-2"
        >
          {isSaving ? "שומר..." : "שמור תשובה"}
        </Button>
        
        <Button
          type="button"
          onClick={onNext}
          className="bg-[#FFD217] hover:bg-[#f8ca00] text-memoir-darkGray"
        >
          {currentQuestionIndex < totalQuestions - 1 ? (
            <>
              שאלה הבאה
              <ChevronLeft className="mr-2 h-4 w-4" />
            </>
          ) : (
            "סיום והמשך ליצירת תוכן העניינים"
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuestionFormControls;
