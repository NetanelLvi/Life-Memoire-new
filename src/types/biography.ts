
/**
 * Biography status types
 */
export enum BiographyStatus {
  Draft = "Draft",
  QuestionnaireCompleted = "QuestionnaireCompleted",
  TOCGenerated = "TOCGenerated",
  TOCApproved = "TOCApproved",
  DraftGenerated = "DraftGenerated",
  InProgress = "InProgress",
  Completed = "Completed",
  Published = "Published" // Added Published status
}

/**
 * Biography progress tracking
 */
export enum BiographyProgress {
  Questionnaire = "questionnaire",
  TOC = "toc",
  Draft = "draft",
  Editor = "editor",
  Export = "export"
}

/**
 * Biography data interface
 */
export interface Biography {
  id: string;
  title: string;
  status: BiographyStatus;
  progress: BiographyProgress;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * Chapter data interface
 */
export interface Chapter {
  id: string;
  title: string;
  content: string | null;
  biography_id: string;
  chapter_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Table of contents chapter structure
 */
export interface TOCChapter {
  title: string;
  description: string;
}

/**
 * Table of contents data structure
 */
export interface TOCData {
  id: string;
  biography_id: string;
  structure: TOCChapter[];
  approved: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Biography draft data structure
 */
export interface BiographyDraft {
  id: string;
  biography_id: string;
  full_content: string;
  chapter_content: Record<string, string>;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}
