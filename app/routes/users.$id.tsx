import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { getQuestionsByUserId } from "~/models/question.server";
import { getAnswersByUserId } from "~/models/answer.server";
import { formatDistanceToNow } from "date-fns";
import QuestionCard from "~/components/QuestionCard";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.user) {
    return [
      { title: "User Not Found | Prompt Overflow" },
      { name: "description", content: "The user you're looking for doesn't exist." },
    ];
  }
  
  return [
    { title: `${data.user.username} | Prompt Overflow` },
    { name: "description", content: `Profile page for ${data.user.username} on Prompt Overflow` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.id;
  if (!userId) {
    throw new Response("User ID is required", { status: 400 });
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const [questions, answers] = await Promise.all([
    getQuestionsByUserId(userId),
    getAnswersByUserId(userId),
  ]);

  return json({
    user,
    questions,
    answers,
    stats: {
      questionCount: questions.length,
      answerCount: answers.length,
      acceptedAnswerCount: answers.filter(answer => answer.isAccepted).length,
    },
  });
}

export default function UserProfile() {
  const { user, questions, answers, stats } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* User profile header */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <div className="h-24 w-24 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-4xl">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {user.username}
                </h1>
                <p className="text-gray-500 mb-4">
                  Member for {formatDistanceToNow(new Date(user.createdAt))}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {user.reputation}
                    </div>
                    <div className="text-sm text-gray-500">reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.questionCount}
                    </div>
                    <div className="text-sm text-gray-500">questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.answerCount}
                    </div>
                    <div className="text-sm text-gray-500">answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.acceptedAnswerCount}
                    </div>
                    <div className="text-sm text-gray-500">accepted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's questions */}
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
                  <QuestionCard question={question} user={user} />
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                This user hasn't asked any questions yet.
              </div>
            )}
          </div>
        </div>

        {/* User's answers */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Answers
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {answers.length > 0 ? (
              answers.slice(0, 5).map((answer) => (
                <div key={answer.id} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex flex-col items-center mr-4 text-center">
                      <div className="text-gray-700 font-medium">
                        {answer.votes}
                        <div className="text-xs text-gray-500">votes</div>
                      </div>
                      {answer.isAccepted && (
                        <div className="mt-2 text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {answer.body.length > 200
                          ? answer.body.substring(0, 200) + "..."
                          : answer.body}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>
                          Answered {formatDistanceToNow(new Date(answer.createdAt))} ago on{" "}
                          <Link
                            to={`/questions/${answer.questionId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            this question
                          </Link>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                This user hasn't answered any questions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
