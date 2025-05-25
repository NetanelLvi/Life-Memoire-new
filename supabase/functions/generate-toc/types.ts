
// Type definitions for the generate-toc function

export interface RequestBody {
  biographyId: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface TOCChapter {
  title: string;
  description: string;
}

export interface APIResponse {
  success: boolean;
  toc?: TOCChapter[];
  error?: string;
  code?: string;
}
