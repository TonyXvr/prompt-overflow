import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllQuestions } from "~/models/question.server";
import { getAllTags } from "~/models/tag.server";
import { getUserById } from "~/models/user.server";
import QuestionCard from "~/components/QuestionCard";
import TagBadge from "~/components/TagBadge";

export const meta: MetaFunction = () => {
  return [
    { title: "Prompt Overflow - Where AI Prompt Engineers Learn & Share" },
    { name: "description", content: "A community for AI prompt engineers to learn, share knowledge, and build their careers." },
  ];
};

export async function loader() {
  const [questions, tags] = await Promise.all([
    getAllQuestions(),
    getAllTags(),
  ]);

  // Get the top 5 questions and top 10 tags
  const topQuestions = questions.slice(0, 5);
  const topTags = tags.slice(0, 10);

  // Get the user for each question
  const users = await Promise.all(
    topQuestions.map((question) => getUserById(question.userId))
  );

  return json({
    questions: topQuestions,
    tags: topTags,
    users: users.reduce((acc, user, index) => {
      if (user) {
        acc[topQuestions[index].userId] = user;
      }
      return acc;
    }, {} as Record<string, any>),
  });
}

export default function Index() {
  const { questions, tags, users } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-8 md:px-10 md:py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to Prompt Overflow
          </h1>
          <p className="text-lg md:text-xl max-w-3xl">
            A community for AI prompt engineers to learn, share knowledge, and build their careers.
            Get help with your prompts for ChatGPT, Midjourney, DALL-E, and more.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Top Questions
              </h2>
              <a
                href="/questions"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all questions
              </a>
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
                  No questions yet. Be the first to ask!
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Popular Tags
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
              <div className="mt-4">
                <a
                  href="/tags"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all tags
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Join the Community
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Get the most out of Prompt Overflow by signing up for an account.
              </p>
              <div className="space-y-3">
                <a
                  href="/register"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign up
                </a>
                <a
                  href="/login"
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
