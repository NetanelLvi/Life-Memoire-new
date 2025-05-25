
import { TOCChapter } from "../types.ts";

/**
 * Parses the OpenAI response to extract the TOC structure
 */
export function parseOpenAIResponse(openAIData: any): TOCChapter[] {
  try {
    if (!openAIData.choices || 
        !openAIData.choices[0] || 
        !openAIData.choices[0].message || 
        !openAIData.choices[0].message.content) {
      console.error("[OpenAI ERROR] Invalid response format");
      throw new Error("Invalid response format from OpenAI API");
    }

    const textContent = openAIData.choices[0].message.content.trim();
    if (!textContent) {
      console.error("[OpenAI ERROR] Empty response content");
      throw new Error("Empty text content from OpenAI API");
    }

    console.log(`[OpenAI] Raw response: ${textContent.substring(0, 100)}...`);
    
    // Try to extract JSON from the response
    try {
      // First try: See if it's directly a JSON array
      const parsedData = JSON.parse(textContent);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      } else {
        throw new Error("Response is not an array");
      }
    } catch (jsonError) {
      console.log("[OpenAI] Direct JSON parse failed, trying to extract JSON from text");
      
      // Second try: Extract JSON array from text using regex
      const jsonMatch = textContent.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          const parsedData = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            return parsedData;
          }
        } catch (e) {
          console.error("[OpenAI ERROR] Failed to parse extracted JSON:", e);
        }
      }
      
      console.error("[OpenAI ERROR] Could not parse response as JSON");
      throw new Error("Failed to parse JSON from OpenAI response");
    }
  } catch (error) {
    console.error(`[OpenAI ERROR] parseOpenAIResponse: ${error.message}`);
    
    // Return fallback TOC if parsing fails
    console.log("[OpenAI] Using fallback TOC structure due to parsing error");
    return [
      {
        title: "Chapter 1: Introduction",
        description: "An introduction to the person's life and background"
      },
      {
        title: "Chapter 2: Early Years",
        description: "The early years and formative experiences"
      },
      {
        title: "Chapter 3: Adult Life",
        description: "Major life events and achievements"
      },
      {
        title: "Chapter 4: Career and Accomplishments",
        description: "Professional achievements and contributions"
      },
      {
        title: "Chapter 5: Legacy and Impact",
        description: "The lasting impact and legacy"
      }
    ];
  }
}
