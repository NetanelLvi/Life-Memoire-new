
import { QuestionAnswer } from "../types.ts";

/**
 * Formats question-answer pairs for OpenAI, filtering out empty answers
 */
export function formatQAPairs(
  answers: any[],
  questionsMap: Record<string, string>
): QuestionAnswer[] {
  try {
    console.log(`[OpenAI] Formatting ${answers.length} answers with questions map`);
    
    // Filter only answers that have content
    const answersWithContent = answers.filter(answer => 
      answer.answer_text && answer.answer_text.trim().length > 0
    );
    
    console.log(`[OpenAI] After filtering, found ${answersWithContent.length} answers with content`);
    
    // If no answers with content, return empty array
    if (answersWithContent.length === 0) {
      console.log("[OpenAI] No answers with content found");
      return [];
    }
    
    // Map to proper format for OpenAI
    const formatted = answersWithContent.map(answer => {
      const questionText = questionsMap[answer.question_id] || "Unknown question";
      return {
        question: questionText,
        answer: answer.answer_text.trim()
      };
    });
    
    // Log sample for debugging
    if (formatted.length > 0) {
      console.log(`[OpenAI] Sample QA pair: ${JSON.stringify(formatted[0])}`);
    }
    
    return formatted;
  } catch (error) {
    console.error(`[OpenAI ERROR] formatQAPairs: ${error.message}`);
    throw error;
  }
}
