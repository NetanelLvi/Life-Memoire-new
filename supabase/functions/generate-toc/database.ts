
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { TOCChapter } from "./types.ts";

/**
 * Verifies that a biography with the given ID exists
 * Uses service role client to bypass RLS policies
 */
export async function verifyBiographyExists(biographyId: string): Promise<boolean> {
  // Use service role client to bypass RLS
  const supabase = initSupabaseClient(true);
  console.log(`[DB] Verifying biography exists: ${biographyId}`);
  
  try {
    const { data, error } = await supabase
      .from("biographies")
      .select("id")
      .eq("id", biographyId)
      .maybeSingle();

    if (error) {
      console.error(`[DB ERROR] Failed to verify biography: ${error.message}`);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error(`[DB ERROR] verifyBiographyExists: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches all answers for a biography regardless of content status
 * Uses service role client to bypass RLS policies
 */
export async function fetchAnswers(biographyId: string): Promise<any[]> {
  // Use service role client to bypass RLS
  const supabase = initSupabaseClient(true);
  console.log(`[DB] Fetching all answers for biography: ${biographyId}`);
  
  try {
    const { data, error } = await supabase
      .from("biography_answers")
      .select("question_id, answer_text")
      .eq("biography_id", biographyId);

    if (error) {
      console.error(`[DB ERROR] Failed to fetch answers: ${error.message}`);
      throw new Error(`Database error: ${error.message}`);
    }

    // Log the retrieved answers
    console.log(`[DB] Retrieved ${data?.length || 0} answers for biography ID: ${biographyId}`);
    
    if (!data || data.length === 0) {
      console.log(`[DB] No answers found for biography: ${biographyId}`);
      throw new Error("No answers found for this biography");
    }
    
    return data;
  } catch (error) {
    console.error(`[DB ERROR] fetchAnswers: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches all questions from the database
 */
export async function fetchQuestions(): Promise<Record<string, string>> {
  // Use service role client to bypass RLS
  const supabase = initSupabaseClient(true);
  console.log(`[DB] Fetching all questions`);
  
  try {
    const { data, error } = await supabase
      .from("biography_questions")
      .select("id, question_text");

    if (error) {
      console.error(`[DB ERROR] Failed to fetch questions: ${error.message}`);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error(`[DB] No questions found in database`);
      throw new Error("No questions found in database");
    }

    console.log(`[DB] Retrieved ${data.length} questions`);

    // Map question IDs to question texts
    const questionsMap = data.reduce((acc: Record<string, string>, q: any) => {
      acc[q.id] = q.question_text;
      return acc;
    }, {});
    
    return questionsMap;
  } catch (error) {
    console.error(`[DB ERROR] fetchQuestions: ${error.message}`);
    throw error;
  }
}

/**
 * Saves the TOC to the database for a specific biography
 * Uses service role client to bypass RLS policies
 */
export async function saveTOCToDatabase(
  biographyId: string, 
  tocData: TOCChapter[]
): Promise<void> {
  // Use service role client to bypass RLS
  const supabase = initSupabaseClient(true);
  console.log(`[DB] Saving TOC with ${tocData.length} chapters for biography: ${biographyId}`);
  
  try {
    // Check if a TOC already exists for this biography
    const { data: existingTOC, error: checkError } = await supabase
      .from("biography_toc")
      .select("id")
      .eq("biography_id", biographyId)
      .single();
    
    // Determine if we should insert or update
    let saveOperation;
    if (checkError && checkError.code === "PGRST116") {
      // No TOC exists, insert a new one
      console.log(`[DB] Creating new TOC entry for biography: ${biographyId}`);
      saveOperation = supabase
        .from("biography_toc")
        .insert({
          biography_id: biographyId,
          structure: tocData,
          approved: false,
          updated_at: new Date().toISOString()
        });
    } else {
      // TOC exists, update it
      console.log(`[DB] Updating existing TOC for biography: ${biographyId}`);
      saveOperation = supabase
        .from("biography_toc")
        .update({
          structure: tocData,
          approved: false,
          updated_at: new Date().toISOString()
        })
        .eq("biography_id", biographyId);
    }
    
    // Execute the save operation
    const { error: saveError } = await saveOperation;
    if (saveError) {
      console.error(`[DB ERROR] Failed to save TOC: ${saveError.message}`);
      throw new Error(`Failed to save TOC: ${saveError.message}`);
    }

    // Update the biography progress status
    console.log(`[DB] Updating biography status to 'TOCGenerated'`);
    const { error: progressError } = await supabase
      .from("biographies")
      .update({
        progress: "toc",
        status: "TOCGenerated",
        updated_at: new Date().toISOString()
      })
      .eq("id", biographyId);

    if (progressError) {
      console.warn(`[DB WARNING] Failed to update biography progress: ${progressError.message}`);
      // Don't throw here, as the TOC is already saved
    }
    
    console.log(`[DB] TOC saved successfully for biography: ${biographyId}`);
  } catch (error) {
    console.error(`[DB ERROR] saveTOCToDatabase: ${error.message}`);
    throw error;
  }
}
