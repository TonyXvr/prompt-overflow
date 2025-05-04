import { json, redirect, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { requireUser } from "~/utils/auth.server";
import { createQuestion } from "~/models/question.server";
import { incrementTagCount } from "~/models/tag.server";
import { QuestionSchema } from "~/utils/validation";
import MarkdownEditor from "~/components/MarkdownEditor";
import ErrorMessage from "~/components/ErrorMessage";

export const meta: MetaFunction = () => {
  return [
    { title: "Ask a Question | Prompt Overflow" },
    { name: "description", content: "Ask a question on Prompt Overflow" },
  ];
};

export async function loader({ request }: ActionFunctionArgs) {
  // Make sure the user is logged in
  await requireUser(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  const tags = formData.get("tags");

  try {
    const result = QuestionSchema.parse({ title, body, tags });
    
    // Create the question
    const question = await createQuestion(
      result.title,
      result.body,
      user.id,
      result.tags
    );
    
    // Increment the count for each tag
    await Promise.all(result.tags.map(tag => incrementTagCount(tag)));
    
    return redirect(`/questions/${question.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return json({ fieldErrors }, { status: 400 });
    }
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export default function AskQuestion() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ask a Question</h1>
        
        {actionData?.error && <ErrorMessage>{actionData.error}</ErrorMessage>}
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Form method="post" className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. How to create a ChatGPT prompt for summarizing research papers?"
                required
              />
              {actionData?.fieldErrors?.title && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.fieldErrors.title[0]}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Be specific and imagine you're asking a question to another person.
              </p>
            </div>
            
            <div>
              <MarkdownEditor
                name="body"
                label="Body"
                placeholder="Describe your question in detail..."
                required
                error={actionData?.fieldErrors?.body?.[0]}
              />
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. chatgpt, prompt-engineering, summarization"
                required
              />
              {actionData?.fieldErrors?.tags && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.fieldErrors.tags[0]}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Add up to 5 tags to describe what your question is about. Separate tags with commas.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Post Your Question
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
