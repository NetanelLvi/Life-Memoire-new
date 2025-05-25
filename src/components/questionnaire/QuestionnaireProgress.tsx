
import { Progress } from "@/components/ui/progress";
import { Question } from "@/types/questionnaire";

interface QuestionnaireProgressProps {
  questions: Question[];
  answeredCount: number;
}

const QuestionnaireProgress = ({
  questions,
  answeredCount,
}: QuestionnaireProgressProps) => {
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 
    ? Math.round((answeredCount / totalQuestions) * 100) 
    : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">התקדמות השאלון</span>
        <span className="text-sm font-medium">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="mt-2 text-xs text-gray-500 text-center">
        {answeredCount} מתוך {totalQuestions} שאלות הושלמו
      </div>
    </div>
  );
};

export default QuestionnaireProgress;
