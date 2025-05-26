import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface BiographyRequest {
  biographyId: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface TOCChapter {
  title: string;
  description: string;
}

// Helper to escape special characters for regex
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

serve(async (req) => {
  console.log("[MAIN] Starting generate-biography-draft function");
  console.log(`[MAIN] Request method: ${req.method}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role to bypass RLS
    const supabase = initSupabaseClient(true);

    // Get JWT token from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("[AUTH] Error getting user:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { biographyId } = await req.json() as BiographyRequest;
    if (!biographyId) {
      return new Response(JSON.stringify({ error: "Biography ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[MAIN] Processing request for biography: ${biographyId}`);

    // Verify biography exists and belongs to the user
    const { data: biography, error: biographyError } = await supabase
      .from("biographies")
      .select("*")
      .eq("id", biographyId)
      .eq("user_id", user.id)
      .single();

    if (biographyError || !biography) {
      console.error("[DB] Error verifying biography:", biographyError?.message);
      return new Response(
        JSON.stringify({
          error: "Biography not found or you don't have permission to access it",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[MAIN] Successfully verified biography exists: ${biographyId}`);

    // Get all answers for the biography
    console.log(`[MAIN] Fetching answers for biography: ${biographyId}`);
    const { data: answers, error: answersError } = await supabase
      .from("biography_answers")
      .select("*, biography_questions!inner(question_text)")
      .eq("biography_id", biographyId);

    if (answersError) {
      console.error("[DB] Error fetching answers:", answersError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch biography answers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[MAIN] Successfully fetched ${answers.length} answers`);

    // Get the TOC structure for the biography
    console.log(`[MAIN] Fetching TOC for biography: ${biographyId}`);
    const { data: tocData, error: tocError } = await supabase
      .from("biography_toc")
      .select("*")
      .eq("biography_id", biographyId)
      .eq("approved", true)
      .single();

    if (tocError) {
      console.error("[DB] Error fetching TOC:", tocError.message);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch approved TOC. Has the TOC been approved?",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const structure = tocData?.structure as TOCChapter[];
    console.log(`[MAIN] Successfully fetched TOC with ${structure.length} chapters`);

    // Get biography settings
    console.log(`[MAIN] Fetching settings for biography: ${biographyId}`);
    const { data: settings, error: settingsError } = await supabase
      .from("biography_settings")
      .select("*")
      .eq("biography_id", biographyId)
      .maybeSingle();

    if (settingsError) {
      console.error("[DB] Error fetching settings:", settingsError.message);
      // Continue without settings if not found
    }

    const language = settings?.language || "Hebrew";
    const tone = settings?.tone || "neutral";
    const writing_style = settings?.writing_style || "academic";

    console.log(`[MAIN] Using language: ${language}, tone: ${tone}, style: ${writing_style}`);

    // Format question and answer data
    const qaData: QuestionAnswer[] = answers.map((answer) => ({
      question: answer.biography_questions.question_text,
      answer: answer.answer_text || "",
    }));

    // Filter out empty answers
    const filteredQaData = qaData.filter(
      (qa) => qa.answer && qa.answer.trim() !== ""
    );
    console.log(`[MAIN] Formatted ${filteredQaData.length} QA pairs with content`);

    // Build the OpenAI prompt
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: `You are a professional biographer specializing in creating compelling life stories. 
        Write a biography in ${language} language using a ${tone} tone and ${writing_style} writing style.
        Structure the biography according to the provided table of contents, with each chapter covering the topics described.
        Use all the information from the provided questions and answers to create a coherent, engaging narrative.
        Format the biography with clear paragraphs using HTML <p> tags for each paragraph.
        Return ONLY the biography text, without any additional commentary, notes, or explanations.`,
      },
      {
        role: "system",
        content: `Table of Contents:\n${structure
          .map((chapter, index) => `${index + 1}. ${chapter.title}: ${chapter.description}`)
          .join("\n")}`,
      },
      {
        role: "user",
        content: `Here are the questions and answers to use for creating the biography: ${JSON.stringify(
          filteredQaData
        )}`,
      },
    ];

    if (!OPENAI_API_KEY) {
      console.error("[OpenAI] Missing API key");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API
    console.log("[OpenAI] Calling API to generate biography draft");
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a modern, cost-effective model
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error("[OpenAI] API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate biography draft" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await openaiResponse.json();
    let generatedText = result.choices[0].message.content;
    console.log("[OpenAI] Successfully generated biography text");

    // Post-process generatedText to ensure proper paragraph formatting
    generatedText = generatedText
      .split(/\n\s*\n/) // Split by one or more newlines with optional whitespace in between
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p>${p}</p>`)
      .join(""); // Join without extra newlines, as <p> tags handle block display

    // Process the generated text to separate into chapters
    const chapters: Record<string, string> = {};
    let currentTextForChapterParsing = generatedText; // Use the HTML formatted text for chapter parsing

    structure.forEach((chapter, index) => {
      const chapterIndex = index + 1;
      const chapterTitle = chapter.title.replace(/^Chapter \d+:\s*/, "").trim();
      
      // Create regex patterns to find chapter headings (now potentially within <p> tags or as plain text)
      const patterns = [
        new RegExp(`<p>Chapter ${chapterIndex}[.:] ?${chapterTitle}</p>`, "i"),
        new RegExp(`Chapter ${chapterIndex}[.:] ?${chapterTitle}`, "i"),
        new RegExp(`<p>${chapterIndex}\\. ?${chapterTitle}</p>`, "i"),
        new RegExp(`${chapterIndex}\\. ?${chapterTitle}`, "i"),
        new RegExp(`<p>${chapterTitle}</p>`, "i"),
        new RegExp(`${chapterTitle}`, "i"),
      ];
      
      // Find where the current chapter starts
      let chapterStartMatch: RegExpMatchArray | null = null; // Explicitly type to allow null
      for (const pattern of patterns) {
        const match = currentTextForChapterParsing.match(pattern);
        if (match) {
          chapterStartMatch = match;
          break;
        }
      }
      
      if (!chapterStartMatch || chapterStartMatch.index === undefined) { // Check for undefined index
        console.log(`[Parser] Could not find start of chapter ${chapterIndex}: ${chapterTitle}`);
        return;
      }
      
      const chapterStart = chapterStartMatch.index;
      let chapterEnd = currentTextForChapterParsing.length;
      
      // Check if there's a next chapter to determine the end
      if (index < structure.length - 1) {
        const nextChapterTitle = structure[index + 1].title.replace(/^Chapter \d+:\s*/, "").trim();
        const nextChapterPatterns = [
          new RegExp(`<p>Chapter ${chapterIndex + 1}[.:] ?${nextChapterTitle}</p>`, "i"),
          new RegExp(`Chapter ${chapterIndex + 1}[.:] ?${nextChapterTitle}`, "i"),
          new RegExp(`<p>${chapterIndex + 1}\\. ?${nextChapterTitle}</p>`, "i"),
          new RegExp(`${chapterIndex + 1}\\. ?${nextChapterTitle}`, "i"),
          new RegExp(`<p>${nextChapterTitle}</p>`, "i"),
          new RegExp(`${nextChapterTitle}`, "i"),
        ];
        
        for (const pattern of nextChapterPatterns) {
          const match = currentTextForChapterParsing.substring(chapterStart).match(pattern); // Search only after current chapter start
          if (match && match.index !== undefined) {
            chapterEnd = chapterStart + match.index; // Adjust index relative to original string
            break;
          }
        }
      }
      
      // Extract the chapter content
      let chapterContent = currentTextForChapterParsing.substring(chapterStart, chapterEnd).trim();
      
      // Ensure chapter content also has proper <p> tags if not already present
      chapterContent = chapterContent
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p>${p}</p>`)
        .join("");

      chapters[chapter.title] = chapterContent;
      
      // Update the current text to start from the next chapter
      if (chapterEnd < currentTextForChapterParsing.length) {
        currentTextForChapterParsing = currentTextForChapterParsing.substring(chapterEnd);
      }
    });

    console.log(`[Parser] Successfully extracted ${Object.keys(chapters).length} chapters`);
    console.log(`[DB] Attempting to save biography draft for biography: ${biographyId}`);
    console.log(`[DB] Draft content length: ${generatedText.length}`);
    console.log(`[DB] Chapter content keys: ${Object.keys(chapters).join(', ')}`);

    // Save the draft to the database
    const { data: draft, error: draftError } = await supabase
      .from("biography_drafts")
      .insert({
        biography_id: biographyId,
        full_content: generatedText,
        chapter_content: chapters,
        is_ai_generated: true,
      })
      .select("*")
      .single();

    if (draftError) {
      console.error("[DB] Error saving draft:", draftError.message);
      // Log the full error object for more details
      console.error("[DB] Full draft save error object:", JSON.stringify(draftError, null, 2));
      return new Response(
        JSON.stringify({ error: "Failed to save biography draft: " + draftError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log(`[DB] Successfully saved draft with ID: ${draft.id}`);

    // Update the biography status to indicate draft generation
    console.log(`[DB] Updating biography status to 'DraftGenerated'`);
    await supabase
      .from("biographies")
      .update({ status: "DraftGenerated", updated_at: new Date().toISOString() })
      .eq("id", biographyId);

    console.log("[MAIN] Function completed successfully");
    return new Response(
      JSON.stringify({
        message: "Biography draft generated successfully",
        draftId: draft.id,
        chapters: Object.keys(chapters).length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[ERROR] Unhandled exception:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to generate biography draft: " + error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
