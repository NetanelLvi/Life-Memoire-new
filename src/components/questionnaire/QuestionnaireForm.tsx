
import { Form } from "@/components/ui/form";
import { Question, Answer } from "@/types/questionnaire";
import QuestionDisplay from "./QuestionDisplay";
import QuestionFormControls from "./QuestionFormControls";
import QuestionPagination from "./QuestionPagination";
import SaveExitButton from "./SaveExitButton";
import { useQuestionnaireForm } from "@/hooks/useQuestionnaireForm";

interface QuestionnaireFormProps {
  questions: Question[];
  biographyId: string;
  answers: Record<string, Answer>;
  onSaveAnswer: (answer: Answer) => Promise<void>;
  onComplete: () => void;
}

const QuestionnaireForm = ({
  questions,
  biographyId,
  answers,
  onSaveAnswer,
  onComplete,
}: QuestionnaireFormProps) => {
  const {
    form,
    currentQuestion,
    currentQuestionIndex,
    isSaving,
    handleSaveAnswer,
    handleNext,
    handlePrevious,
    handleSaveAndExit,
    jumpToQuestion,
  } = useQuestionnaireForm({
    questions,
    biographyId,
    answers,
    onSaveAnswer,
    onComplete
  });

  if (!currentQuestion) {
    return <div>אין שאלות זמינות</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-memoir-darkGray">
          שאלה {currentQuestionIndex + 1} מתוך {questions.length}
        </h3>
        <SaveExitButton onSaveAndExit={handleSaveAndExit} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSaveAnswer)}>
            <QuestionDisplay 
              currentQuestion={currentQuestion} 
              form={form} 
            />

            <QuestionFormControls 
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isSaving={isSaving}
            />
          </form>
        </Form>
      </div>

      <QuestionPagination 
        currentQuestionIndex={currentQuestionIndex} 
        questions={questions}
        onQuestionSelect={jumpToQuestion} 
      />
    </div>
  );
};

export default QuestionnaireForm;
