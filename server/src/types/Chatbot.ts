export type Question = {
  question: string;
  answer: string;
};

export type Topics =
  | "App Functionality"
  | "Medication Configuration"
  | "Medication Intake Recommendations"
  | "Medication Information"
  | "Side Effects"
  | "Unknown";

export type Topic = {
  _id?: string;
  topic: Topics;
  questions: Question[];
};
