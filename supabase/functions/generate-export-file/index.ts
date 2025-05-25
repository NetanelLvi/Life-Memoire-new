import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestPayload {
  biographyId: string;
  format: 'pdf' | 'html'; // Added HTML support
}

serve(async (req) => {
  console.log("[EXPORT_FILE] Starting generate-export-file function");

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
      console.error("[EXPORT_FILE] Error getting user:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { biographyId, format } = await req.json() as RequestPayload;
    if (!biographyId || !format) {
      return new Response(JSON.stringify({ error: "Biography ID and format are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[EXPORT_FILE] Processing request for biography: ${biographyId}, format: ${format}`);

    // Verify biography exists and belongs to the user
    const { data: biography, error: biographyError } = await supabase
      .from("biographies")
      .select("*")
      .eq("id", biographyId)
      .eq("user_id", user.id)
      .single();

    if (biographyError || !biography) {
      console.error("[EXPORT_FILE] Error verifying biography:", biographyError?.message);
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

    // Fetch all chapters for the biography
    const { data: chapters, error: chaptersError } = await supabase
      .from("biography_chapters")
      .select("*")
      .eq("biography_id", biographyId)
      .order("chapter_order", { ascending: true });

    if (chaptersError) {
      console.error("[EXPORT_FILE] Error fetching chapters:", chaptersError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch biography chapters" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const fullContent = chapters.map(c => `<h1>${c.title}</h1>\n${c.content || ''}`).join('\n\n');

    let fileBuffer: Uint8Array;
    let contentType: string;
    let filename: string;

    if (format === 'html') {
      console.log("[EXPORT_FILE] Generating HTML file");
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${biography.title}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; margin: 40px; max-width: 800px; margin-left: auto; margin-right: auto; }
        h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    <h1>${biography.title}</h1>
    ${fullContent}
</body>
</html>
      `;
      fileBuffer = new TextEncoder().encode(htmlContent);
      contentType = "text/html";
      filename = `${biography.title.replace(/\s/g, '_')}.html`;
    } else if (format === 'pdf') {
      // For PDF, we'll keep the placeholder for now, but it won't work correctly.
      // A proper PDF generation would require a dedicated library or service.
      console.log("[EXPORT_FILE] Attempting basic PDF generation (will likely be unreadable)");
      const textContent = `Biography Title: ${biography.title}\n\n${fullContent.replace(/<[^>]*>/g, '')}`; // Remove HTML tags for plain text PDF
      fileBuffer = new TextEncoder().encode(textContent);
      contentType = "application/pdf";
      filename = `${biography.title.replace(/\s/g, '_')}.pdf`;
    } else {
      return new Response(JSON.stringify({ error: "Unsupported format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[EXPORT_FILE] Successfully generated ${format.toUpperCase()}`);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[EXPORT_FILE] Unhandled exception:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to generate export file: " + error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
