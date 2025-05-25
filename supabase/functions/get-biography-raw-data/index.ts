import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestPayload {
  biographyId: string;
}

serve(async (req) => {
  console.log("[RAW_DATA] Starting get-biography-raw-data function");

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
      console.error("[RAW_DATA] Error getting user:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { biographyId } = await req.json() as RequestPayload;
    if (!biographyId) {
      return new Response(JSON.stringify({ error: "Biography ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[RAW_DATA] Processing request for biography: ${biographyId}`);

    // Verify biography exists and belongs to the user
    const { data: biography, error: biographyError } = await supabase
      .from("biographies")
      .select("*")
      .eq("id", biographyId)
      .eq("user_id", user.id)
      .single();

    if (biographyError || !biography) {
      console.error("[RAW_DATA] Error verifying biography:", biographyError?.message);
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

    // Fetch original questionnaire answers
    const { data: answers, error: answersError } = await supabase
      .from("biography_answers")
      .select("*, biography_questions!inner(question_text)")
      .eq("biography_id", biographyId);

    if (answersError) {
      console.error("[RAW_DATA] Error fetching answers:", answersError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch biography answers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formattedAnswers = answers.map(a => ({
      question: a.biography_questions.question_text,
      answer: a.answer_text,
    }));

    // Fetch approved TOC
    const { data: tocData, error: tocError } = await supabase
      .from("biography_toc")
      .select("structure")
      .eq("biography_id", biographyId)
      .eq("approved", true)
      .single();

    if (tocError) {
      console.error("[RAW_DATA] Error fetching TOC:", tocError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch approved TOC" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const responseData = {
      questions_and_answers: formattedAnswers,
      table_of_contents: tocData.structure,
    };

    console.log("[RAW_DATA] Function completed successfully");
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[RAW_DATA] Unhandled exception:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve raw data: " + error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
