import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchQuestions } from "~/models/question.server";
import { searchTags } from "~/models/tag.server";
import { getUserById } from "~/models/user.server";
import QuestionCard from "~/components/QuestionCard";
import TagBadge from "~/components/TagBadge";
import { z } from "zod";
import { SearchSchema } from "~/utils/validation";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: "Search | Prompt Overflow" }];
  
  const { query } = data;
  return [
    { title: `Search results for "${query}" | Prompt Overflow` },
    { name: "description", content: `Search results for "${query}" on Prompt Overflow` },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  
  try {
    // Validate the search query
    SearchSchema.parse({ q: query });
    
    // Search for questions and tags
    const [questions, tags] = await Promise.all([
      searchQuestions(query),
      searchTags(query),
    ]);
    
    // Get the user for each question
    const users = await Promise.all(
      questions.map((question) => getUserById(question.userId))
    );
    
    return json({
      query,
      questions,
      tags,
      users: users.reduce((acc, user, index) => {
        if (user) {
          acc[questions[index].userId] = user;
        }
        return acc;
      }, {} as Record<string, any>),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({
        query,
        questions: [],
        tags: [],
        users: {},
        error: error.errors[0].message,
      });
    }
    
    return json({
      query,
      questions: [],
      tags: [],
      users: {},
      error: "An unexpected error occurred",
    });
  }
}

export default function Search() {
  const { query, questions, tags, users, error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600">
          {error ? (
            error
          ) : questions.length > 0 || tags.length > 0 ? (
            `Found ${questions.length} questions and ${tags.length} tags for "${query}"`
          ) : (
            `No results found for "${query}"`
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Questions */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Questions
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {questions.length > 0 ? (
                questions.map((question) => (
                  <div key={question.id} className="px-6">
                    <QuestionCard
                      question={question}
                      user={users[question.userId]}
                    />
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No questions found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Tags */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Tags
              </h2>
            </div>
            <div className="p-6">
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No tags found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Search tips */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Tips
              </h2>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <span className="font-medium">Be specific:</span> Include details about AI models, prompt techniques, or specific use cases.
                </li>
                <li>
                  <span className="font-medium">Use tags:</span> Search for specific tags like [chatgpt] or [midjourney].
                </li>
                <li>
                  <span className="font-medium">Ask a question:</span> Can't find what you're looking for?{" "}
                  <Link to="/questions/ask" className="text-blue-600 hover:text-blue-800">
                    Ask your own question
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
