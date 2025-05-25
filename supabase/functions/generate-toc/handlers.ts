
import { corsHeaders } from "../_shared/cors.ts";
import { RequestBody, APIResponse, TOCChapter } from "./types.ts";
import { fetchAnswers, fetchQuestions, saveTOCToDatabase, verifyBiographyExists } from "./database.ts";
import { formatQAPairs, generateTOCWithOpenAI } from "./openai.ts";

/**
 * Extract biographyId from request body
 */
export async function extractBiographyId(req: Request): Promise<string> {
  try {
    const body = await req.json();
    
    if (!body || !body.biographyId) {
      console.error("[MAIN ERROR] Missing biographyId in request");
      throw new Error("Biography ID is required");
    }
    
    // Basic validation of UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.biographyId)) {
      console.error(`[MAIN ERROR] Invalid UUID format: ${body.biographyId}`);
      throw new Error("Invalid biography ID format");
    }
    
    return body.biographyId;
  } catch (error) {
    console.error(`[MAIN ERROR] Failed to extract biographyId: ${error.message}`);
    throw new Error(`Failed to extract biography ID: ${error.message}`);
  }
}

/**
 * Main processing function for TOC generation
 */
export async function processTOCGeneration(biographyId: string): Promise<TOCChapter[]> {
  // Step 1: Validate OpenAI API key
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    console.error("[MAIN ERROR] OpenAI API key not configured");
    throw new Error("OpenAI API key is not configured");
  }
  
  // Step 1.5: Verify biography exists
  try {
    console.log(`[MAIN] Attempting to verify biography exists: ${biographyId}`);
    const exists = await verifyBiographyExists(biographyId);
    if (!exists) {
      console.error(`[MAIN ERROR] Biography not found: ${biographyId}`);
      throw new Error(`Biography with ID ${biographyId} not found`);
    }
    console.log(`[MAIN] Successfully verified biography exists: ${biographyId}`);
  } catch (error) {
    console.error(`[MAIN ERROR] Failed to verify biography: ${error.message}`);
    throw new Error(`Error verifying biography: ${error.message}`);
  }
  
  // Step 2: Fetch all answers
  let answers;
  try {
    console.log(`[MAIN] Attempting to fetch answers for biography: ${biographyId}`);
    answers = await fetchAnswers(biographyId);
    console.log(`[MAIN] Successfully fetched ${answers.length} answers`);
  } catch (error) {
    console.error(`[MAIN ERROR] Failed to fetch answers: ${error.message}`);
    throw new Error(
      error.message.includes("No answers found") 
        ? "No answers found for this biography"
        : `Error fetching answers: ${error.message}`
    );
  }
  
  // Step 3: Fetch questions
  let questionsMap;
  try {
    console.log(`[MAIN] Attempting to fetch questions map`);
    questionsMap = await fetchQuestions();
    console.log(`[MAIN] Successfully fetched questions map with ${Object.keys(questionsMap).length} questions`);
  } catch (error) {
    console.error(`[MAIN ERROR] Failed to fetch questions: ${error.message}`);
    throw new Error(`Error fetching questions: ${error.message}`);
  }
  
  // Step 4: Format QA pairs (filter out empty answers)
  const formattedQA = formatQAPairs(answers, questionsMap);
  console.log(`[MAIN] Formatted ${formattedQA.length} QA pairs with content`);
  
  // Step 5: Check if we have any valid answers
  if (formattedQA.length === 0) {
    console.error("[MAIN ERROR] No answers with content found");
    throw new Error("No answers with content found for this biography");
  }
  
  // Step 6: Generate TOC using OpenAI
  try {
    console.log("[MAIN] Calling OpenAI to generate TOC");
    const tocData = await generateTOCWithOpenAI(formattedQA);
    console.log(`[MAIN] Successfully generated TOC with ${tocData.length} chapters`);
    return tocData;
  } catch (error) {
    console.error(`[MAIN ERROR] Failed to generate TOC: ${error.message}`);
    throw new Error(`Error generating TOC: ${error.message}`);
  }
}

/**
 * Save TOC data and update biography status
 */
export async function saveTOCData(biographyId: string, tocData: TOCChapter[]): Promise<void> {
  try {
    await saveTOCToDatabase(biographyId, tocData);
    console.log("[MAIN] Successfully saved TOC to database");
  } catch (error) {
    console.error(`[MAIN ERROR] Failed to save TOC: ${error.message}`);
    throw new Error(`Error saving TOC: ${error.message}`);
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(message: string, code: string, status: number): Response {
  const response: APIResponse = {
    success: false,
    error: message,
    code: code
  };
  
  return new Response(JSON.stringify(response), {
    status: status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(tocData: TOCChapter[]): Response {
  const response: APIResponse = {
    success: true,
    toc: tocData
  };
  
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
