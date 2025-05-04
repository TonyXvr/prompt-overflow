import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getQuestionsByTag } from "~/models/question.server";
import { getTagByName } from "~/models/tag.server";
import { getUserById } from "~/models/user.server";
import QuestionCard from "~/components/QuestionCard";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.tag) {
    return [
      { title: "Tag Not Found | Prompt Overflow" },
      { name: "description", content: "The tag you're looking for doesn't exist." },
    ];
  }
  
  return [
    { title: `${data.tag.name} Questions | Prompt Overflow` },
    { name: "description", content: data.tag.description || `Questions tagged with ${data.tag.name}` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const tagName = params.tag;
  if (!tagName) {
    throw new Response("Tag name is required", { status: 400 });
  }

  const tag = await getTagByName(tagName);
  if (!tag) {
    throw new Response("Tag not found", { status: 404 });
  }

  const questions = await getQuestionsByTag(tagName);
  
  // Get the user for each question
  const users = await Promise.all(
    questions.map((question) => getUserById(question.userId))
  );

  return json({
    tag,
    questions,
    users: users.reduce((acc, user, index) => {
      if (user) {
        acc[questions[index].userId] = user;
      }
      return acc;
    }, {} as Record<string, any>),
  });
}

export default function TagDetail() {
  const { tag, questions, users } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {tag.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
              {tag.count} {tag.count === 1 ? "question" : "questions"}
            </span>
          </div>
          {tag.description && (
            <p className="text-gray-600">{tag.description}</p>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/questions/ask"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ask Question
          </Link>
        </div>
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
              No questions found with this tag.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
