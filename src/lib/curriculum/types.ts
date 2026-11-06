export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type CodeFile = { path: string; code: string };
export type KnowledgeCheck = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type RepositoryExercise = {
  files: CodeFile[];
  testPath: string;
  solution: string;
  command: string;
  steps: string[];
  expected: string;
  checkpoint: KnowledgeCheck;
  checklist: string[];
};
export type Lesson = {
  id: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  objective: string;
  explanation: string;
  source: string;
  starter: string;
  hint: string;
  stage?: string;
  difficulty?: Difficulty;
  order?: number;
  projectExample?: {
    module: string;
    subject: string;
    cases: { name: string; assertion: string }[];
    typedSource: string;
  };
  repository?: RepositoryExercise;
};
