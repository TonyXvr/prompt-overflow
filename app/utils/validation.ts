import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const QuestionSchema = z.object({
  title: z
    .string()
    .min(15, "Title must be at least 15 characters")
    .max(150, "Title must be at most 150 characters"),
  body: z.string().min(30, "Question body must be at least 30 characters"),
  tags: z
    .string()
    .transform(tags => 
      tags
        .split(",")
        .map(tag => tag.trim().toLowerCase())
        .filter(Boolean)
    )
    .refine(tags => tags.length >= 1, "At least one tag is required")
    .refine(tags => tags.length <= 5, "Maximum 5 tags allowed")
    .refine(
      tags => tags.every(tag => tag.length >= 2 && tag.length <= 25),
      "Tags must be between 2 and 25 characters"
    ),
});

export const AnswerSchema = z.object({
  body: z.string().min(30, "Answer must be at least 30 characters"),
});

export const SearchSchema = z.object({
  q: z.string().min(3, "Search query must be at least 3 characters"),
});
