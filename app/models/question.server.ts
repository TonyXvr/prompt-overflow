import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string(),
  title: z.string().min(15).max(150),
  body: z.string().min(30),
  userId: z.string(),
  tags: z.array(z.string()),
  votes: z.number().default(0),
  viewCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Question = z.infer<typeof QuestionSchema>;

// Mock database for questions
let questions: Question[] = [];

export async function getAllQuestions(): Promise<Question[]> {
  return [...questions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getQuestionById(id: string): Promise<Question | null> {
  return questions.find(question => question.id === id) || null;
}

export async function getQuestionsByUserId(userId: string): Promise<Question[]> {
  return questions.filter(question => question.userId === userId);
}

export async function getQuestionsByTag(tag: string): Promise<Question[]> {
  return questions.filter(question => question.tags.includes(tag));
}

export async function createQuestion(
  title: string,
  body: string,
  userId: string,
  tags: string[]
): Promise<Question> {
  const question: Question = {
    id: Math.random().toString(36).substring(2, 15),
    title,
    body,
    userId,
    tags,
    votes: 0,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  questions.push(question);
  return question;
}

export async function updateQuestion(
  id: string,
  data: Partial<Pick<Question, "title" | "body" | "tags">>
): Promise<Question | null> {
  const question = await getQuestionById(id);
  if (!question) return null;
  
  if (data.title) question.title = data.title;
  if (data.body) question.body = data.body;
  if (data.tags) question.tags = data.tags;
  question.updatedAt = new Date();
  
  return question;
}

export async function incrementQuestionViewCount(id: string): Promise<Question | null> {
  const question = await getQuestionById(id);
  if (!question) return null;
  
  question.viewCount += 1;
  return question;
}

export async function voteQuestion(id: string, value: 1 | -1): Promise<Question | null> {
  const question = await getQuestionById(id);
  if (!question) return null;
  
  question.votes += value;
  question.updatedAt = new Date();
  
  return question;
}

export async function searchQuestions(query: string): Promise<Question[]> {
  const lowerQuery = query.toLowerCase();
  return questions.filter(
    question => 
      question.title.toLowerCase().includes(lowerQuery) || 
      question.body.toLowerCase().includes(lowerQuery) ||
      question.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
