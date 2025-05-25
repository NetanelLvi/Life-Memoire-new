
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking OpenAI API key configuration");
    
    // Check if API key is present
    if (!OPENAI_API_KEY) {
      console.log("No OpenAI API key found in environment variables");
      return new Response(JSON.stringify({
        isConfigured: false,
        message: "OpenAI API key is not configured in the environment"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Validate OpenAI API key with a lightweight call
    try {
      console.log("Attempting to validate OpenAI API key");
      const response = await fetch(
        "https://api.openai.com/v1/models",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("OpenAI API key validation failed:", responseData);
        let errorMessage = "Invalid OpenAI API key";
        
        if (responseData.error && responseData.error.message) {
          errorMessage = `Invalid OpenAI API key: ${responseData.error.message}`;
        }
        
        return new Response(JSON.stringify({
          isConfigured: false,
          message: errorMessage,
          statusCode: response.status,
          details: responseData
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log("OpenAI API key is valid");
      return new Response(JSON.stringify({
        isConfigured: true,
        message: "OpenAI API key is valid"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
      
    } catch (error) {
      console.error("Error validating OpenAI API key:", error);
      return new Response(JSON.stringify({
        isConfigured: false,
        message: `Error validating OpenAI API key: ${error.message}`
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
