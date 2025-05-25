
import { QuestionAnswer, TOCChapter } from "./types.ts";
import { parseOpenAIResponse } from "./utils/parser.ts";

/**
 * Calls OpenAI API to generate TOC with retry logic
 */
export async function generateTOCWithOpenAI(formattedQA: QuestionAnswer[]): Promise<TOCChapter[]> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  if (!OPENAI_API_KEY) {
    console.error("[OpenAI ERROR] API key not configured");
    throw new Error("OpenAI API key not configured");
  }

  if (formattedQA.length === 0) {
    console.error("[OpenAI ERROR] No content to generate TOC from");
    throw new Error("No content available to generate TOC");
  }

  const MAX_RETRIES = 2;
  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= MAX_RETRIES) {
    try {
      const systemPrompt = await import("./utils/prompt-utils.ts").then(module => module.createSystemPrompt());
      console.log(`[OpenAI] Calling API (attempt ${retries + 1}/${MAX_RETRIES + 1})`);
      console.log(`[OpenAI] Using ${formattedQA.length} QA pairs as context`);

      const openAIResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: JSON.stringify(formattedQA)
              }
            ],
            temperature: 0.2,
            max_tokens: 1024,
          })
        }
      );

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error(`[OpenAI ERROR] API returned ${openAIResponse.status}: ${errorText}`);
        
        if (retries < MAX_RETRIES) {
          retries++;
          lastError = new Error(`OpenAI API returned status ${openAIResponse.status}: ${errorText}`);
          const delay = Math.pow(2, retries) * 500; // Exponential backoff
          console.log(`[OpenAI] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`OpenAI API returned status ${openAIResponse.status}: ${errorText}`);
      }

      const openAIData = await openAIResponse.json();
      console.log("[OpenAI] Successfully received response");
      
      // Parse the response into TOC chapters
      const tocData = parseOpenAIResponse(openAIData);
      console.log(`[OpenAI] Successfully parsed TOC with ${tocData.length} chapters`);
      
      return tocData;
    } catch (error) {
      console.error(`[OpenAI ERROR] API call failed (attempt ${retries + 1}/${MAX_RETRIES + 1}): ${error.message}`);
      
      if (retries < MAX_RETRIES) {
        retries++;
        lastError = error instanceof Error ? error : new Error(String(error));
        const delay = Math.pow(2, retries) * 500; // Exponential backoff
        console.log(`[OpenAI] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw lastError || error;
    }
  }

  throw lastError || new Error("Failed to generate TOC after retries");
}
