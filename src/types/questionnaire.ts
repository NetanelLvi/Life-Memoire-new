
export interface Question {
  id: string;
  question_text: string;
  question_order: number;
  created_at: string;
}

export interface Answer {
  id?: string;
  biography_id: string;
  question_id: string;
  answer_text: string | null;
  updated_at?: string;
}

export interface QuestionWithAnswer extends Question {
  answer: Answer | null;
}
