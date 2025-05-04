import { z } from "zod";

export const TagSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(25),
  description: z.string().optional(),
  count: z.number().default(0),
  createdAt: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

// Mock database for tags
let tags: Tag[] = [
  {
    id: "1",
    name: "chatgpt",
    description: "Questions related to ChatGPT prompts and usage",
    count: 0,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "midjourney",
    description: "Questions about Midjourney image generation prompts",
    count: 0,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "dalle",
    description: "Questions about DALL-E image generation prompts",
    count: 0,
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "stable-diffusion",
    description: "Questions about Stable Diffusion prompts and techniques",
    count: 0,
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "prompt-engineering",
    description: "General prompt engineering techniques and best practices",
    count: 0,
    createdAt: new Date(),
  },
];

export async function getAllTags(): Promise<Tag[]> {
  return [...tags].sort((a, b) => b.count - a.count);
}

export async function getTagById(id: string): Promise<Tag | null> {
  return tags.find(tag => tag.id === id) || null;
}

export async function getTagByName(name: string): Promise<Tag | null> {
  return tags.find(tag => tag.name.toLowerCase() === name.toLowerCase()) || null;
}

export async function createTag(name: string, description?: string): Promise<Tag> {
  const tag: Tag = {
    id: Math.random().toString(36).substring(2, 15),
    name: name.toLowerCase(),
    description,
    count: 0,
    createdAt: new Date(),
  };
  
  tags.push(tag);
  return tag;
}

export async function incrementTagCount(name: string): Promise<Tag | null> {
  let tag = await getTagByName(name);
  
  // If tag doesn't exist, create it
  if (!tag) {
    tag = await createTag(name);
  }
  
  tag.count += 1;
  return tag;
}

export async function searchTags(query: string): Promise<Tag[]> {
  const lowerQuery = query.toLowerCase();
  return tags.filter(
    tag => 
      tag.name.toLowerCase().includes(lowerQuery) || 
      (tag.description && tag.description.toLowerCase().includes(lowerQuery))
  );
}
