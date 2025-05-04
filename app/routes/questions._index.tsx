import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllQuestions } from "~/models/question.server";
import { getUserById } from "~/models/user.server";
import QuestionCard from "~/components/QuestionCard";

export const meta: MetaFunction = () => {
  return [
    { title: "All Questions | Prompt Overflow" },
    { name: "description", content: "Browse all questions on Prompt Overflow" },
  ];
};

export async function loader() {
  const questions = await getAllQuestions();
  
  // Get the user for each question
  const users = await Promise.all(
    questions.map((question) => getUserById(question.userId))
  );

  return json({
    questions,
    users: users.reduce((acc, user, index) => {
      if (user) {
        acc[questions[index].userId] = user;
      }
      return acc;
    }, {} as Record<string, any>),
  });
}

export default function Questions() {
  const { questions, users } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
        <Link
          to="/questions/ask"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ask Question
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </div>
          <div className="flex space-x-4">
            <button className="text-sm text-gray-700 hover:text-blue-600 font-medium">
              Newest
            </button>
            <button className="text-sm text-gray-500 hover:text-blue-600">
              Active
            </button>
            <button className="text-sm text-gray-500 hover:text-blue-600">
              Unanswered
            </button>
          </div>
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
  );
}
