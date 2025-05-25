
import { corsHeaders } from "../_shared/cors.ts";
import { 
  extractBiographyId, 
  processTOCGeneration, 
  saveTOCData,
  createErrorResponse, 
  createSuccessResponse 
} from "./handlers.ts";

/**
 * Main handler for the generate-toc edge function
 */
Deno.serve(async (req: Request) => {
  console.log("[MAIN] Starting generate-toc function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract biographyId from request
    const biographyId = await extractBiographyId(req);
    console.log(`[MAIN] Processing request for biography: ${biographyId}`);
    
    // Process TOC generation
    const tocData = await processTOCGeneration(biographyId);
    
    // Save TOC to database
    await saveTOCData(biographyId, tocData);
    
    // Return success response
    console.log("[MAIN] Function completed successfully");
    return createSuccessResponse(tocData);
    
  } catch (error) {
    // Handle errors based on error message
    console.error(`[MAIN ERROR] Error in generate-toc: ${error.message}`);
    
    // Determine error code and status
    let errorCode = "UNKNOWN_ERROR";
    let status = 500;
    
    if (error.message.includes("Biography ID is required") || 
        error.message.includes("Failed to extract biography ID")) {
      errorCode = "INVALID_REQUEST";
      status = 400;
    } else if (error.message.includes("OpenAI API key not configured")) {
      errorCode = "MISSING_API_KEY";
      status = 400;
    } else if (error.message.includes("No answers found")) {
      errorCode = "NO_ANSWERS";
      status = 400;
    } else if (error.message.includes("No answers with content found")) {
      errorCode = "EMPTY_ANSWERS";
      status = 400;
    } else if (error.message.includes("Error generating TOC")) {
      errorCode = "OPENAI_API_ERROR";
      status = 500;
    } else if (error.message.includes("Error saving TOC")) {
      errorCode = "DATABASE_ERROR";
      status = 500;
    }
    
    return createErrorResponse(error.message, errorCode, status);
  }
});
