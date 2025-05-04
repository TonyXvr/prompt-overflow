import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  passwordHash: z.string(),
  reputation: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Mock database for users
let users: User[] = [];

export async function getUserById(id: string): Promise<User | null> {
  return users.find(user => user.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find(user => user.email === email) || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return users.find(user => user.username === username) || null;
}

export async function createUser(email: string, username: string, passwordHash: string): Promise<User> {
  const user: User = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    username,
    passwordHash,
    reputation: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  users.push(user);
  return user;
}

export async function updateUserReputation(userId: string, change: number): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  
  user.reputation += change;
  user.updatedAt = new Date();
  
  return user;
}
