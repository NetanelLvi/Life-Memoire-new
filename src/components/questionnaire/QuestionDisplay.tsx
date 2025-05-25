
import { Question } from "@/types/questionnaire";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface QuestionDisplayProps {
  currentQuestion: Question;
  form: UseFormReturn<{
    answer: string;
  }, any>;
}

const QuestionDisplay = ({ currentQuestion, form }: QuestionDisplayProps) => {
  return (
    <FormField
      control={form.control}
      name="answer"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xl font-medium text-memoir-darkGray">
            {currentQuestion.question_text}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="הכנס את התשובה שלך כאן..."
              className="min-h-[200px] text-right"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default QuestionDisplay;
