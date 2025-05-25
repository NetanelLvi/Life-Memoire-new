import { BiographyDraft } from "@/types/biography";
import { isStringRecord } from "./utils";

/**
 * Validates if the given data matches the BiographyDraft interface
 */
export function validateDraftData(data: unknown): data is BiographyDraft {
  if (!data || typeof data !== 'object') return false;
  
  const draft = data as BiographyDraft;
  
  return (
    typeof draft.id === 'string' &&
    typeof draft.biography_id === 'string' &&
    typeof draft.full_content === 'string' &&
    isStringRecord(draft.chapter_content) &&
    typeof draft.is_ai_generated === 'boolean' &&
    typeof draft.created_at === 'string' &&
    typeof draft.updated_at === 'string'
  );
}

/**
 * Transforms raw data into a valid BiographyDraft object
 * Returns null if the data is invalid
 */
export function transformDraftData(data: unknown): BiographyDraft | null {
  if (!validateDraftData(data)) return null;
  
  return {
    ...data,
    chapter_content: data.chapter_content || {}
  };
} 