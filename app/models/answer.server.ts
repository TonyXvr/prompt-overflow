import { z } from "zod";

export const AnswerSchema = z.object({
  id: z.string(),
  body: z.string().min(30),
  questionId: z.string(),
  userId: z.string(),
  votes: z.number().default(0),
  isAccepted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Answer = z.infer<typeof AnswerSchema>;

// Mock database for answers
let answers: Answer[] = [];

export async function getAnswersByQuestionId(questionId: string): Promise<Answer[]> {
  return answers
    .filter(answer => answer.questionId === questionId)
    .sort((a, b) => {
      // Sort by accepted status first, then by votes
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      return b.votes - a.votes;
    });
}

export async function getAnswerById(id: string): Promise<Answer | null> {
  return answers.find(answer => answer.id === id) || null;
}

export async function getAnswersByUserId(userId: string): Promise<Answer[]> {
  return answers.filter(answer => answer.userId === userId);
}

export async function createAnswer(
  body: string,
  questionId: string,
  userId: string
): Promise<Answer> {
  const answer: Answer = {
    id: Math.random().toString(36).substring(2, 15),
    body,
    questionId,
    userId,
    votes: 0,
    isAccepted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  answers.push(answer);
  return answer;
}

export async function updateAnswer(
  id: string,
  body: string
): Promise<Answer | null> {
  const answer = await getAnswerById(id);
  if (!answer) return null;
  
  answer.body = body;
  answer.updatedAt = new Date();
  
  return answer;
}

export async function voteAnswer(id: string, value: 1 | -1): Promise<Answer | null> {
  const answer = await getAnswerById(id);
  if (!answer) return null;
  
  answer.votes += value;
  answer.updatedAt = new Date();
  
  return answer;
}

export async function acceptAnswer(id: string): Promise<Answer | null> {
  const answer = await getAnswerById(id);
  if (!answer) return null;
  
  // First, unaccept any previously accepted answers for this question
  const questionAnswers = await getAnswersByQuestionId(answer.questionId);
  for (const qa of questionAnswers) {
    if (qa.isAccepted) {
      qa.isAccepted = false;
      qa.updatedAt = new Date();
    }
  }
  
  // Then accept this answer
  answer.isAccepted = true;
  answer.updatedAt = new Date();
  
  return answer;
}
