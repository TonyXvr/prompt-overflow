import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData, useActionData } from "@remix-run/react";
import { z } from "zod";
import { getQuestionById, incrementQuestionViewCount, voteQuestion } from "~/models/question.server";
import { getAnswersByQuestionId, createAnswer } from "~/models/answer.server";
import { getUserById, updateUserReputation } from "~/models/user.server";
import { getUser, requireUser } from "~/utils/auth.server";
import { renderMarkdown } from "~/utils/markdown.server";
import { AnswerSchema } from "~/utils/validation";
import { formatDistanceToNow } from "date-fns";
import MarkdownEditor from "~/components/MarkdownEditor";
import AnswerCard from "~/components/AnswerCard";
import ErrorMessage from "~/components/ErrorMessage";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.question) {
    return [
      { title: "Question Not Found | Prompt Overflow" },
      { name: "description", content: "The question you're looking for doesn't exist." },
    ];
  }
  
  return [
    { title: `${data.question.title} | Prompt Overflow` },
    { name: "description", content: data.question.body.substring(0, 160) },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const questionId = params.id;
  if (!questionId) {
    throw new Response("Question ID is required", { status: 400 });
  }

  const question = await getQuestionById(questionId);
  if (!question) {
    throw new Response("Question not found", { status: 404 });
  }

  // Increment view count
  await incrementQuestionViewCount(questionId);

  // Get answers for this question
  const answers = await getAnswersByQuestionId(questionId);

  // Get the current user
  const currentUser = await getUser(request);

  // Get the question author and answer authors
  const questionAuthor = await getUserById(question.userId);
  const answerAuthors = await Promise.all(
    answers.map(answer => getUserById(answer.userId))
  );

  // Render markdown for question and answers
  const renderedQuestion = {
    ...question,
    bodyHtml: renderMarkdown(question.body),
  };

  const renderedAnswers = answers.map(answer => ({
    ...answer,
    bodyHtml: renderMarkdown(answer.body),
  }));

  return json({
    question: renderedQuestion,
    answers: renderedAnswers,
    questionAuthor,
    answerAuthors: answerAuthors.reduce((acc, author, index) => {
      if (author) {
        acc[answers[index].userId] = author;
      }
      return acc;
    }, {} as Record<string, any>),
    currentUser,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const questionId = params.id;
  if (!questionId) {
    throw new Response("Question ID is required", { status: 400 });
  }

  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Handle voting on the question
  if (intent === "vote") {
    const value = Number(formData.get("value"));
    if (value !== 1 && value !== -1) {
      return json({ error: "Invalid vote value" }, { status: 400 });
    }

    const question = await getQuestionById(questionId);
    if (!question) {
      return json({ error: "Question not found" }, { status: 404 });
    }

    // Don't allow voting on your own question
    if (question.userId === user.id) {
      return json({ error: "You cannot vote on your own question" }, { status: 400 });
    }

    // Update the question's vote count
    await voteQuestion(questionId, value as 1 | -1);

    // Update the author's reputation
    await updateUserReputation(question.userId, value);

    return json({ success: true });
  }

  // Handle adding an answer
  if (intent === "answer") {
    const body = formData.get("body");

    try {
      const result = AnswerSchema.parse({ body });
      
      // Create the answer
      await createAnswer(result.body, questionId, user.id);
      
      // Update the answerer's reputation
      await updateUserReputation(user.id, 1);
      
      return redirect(`/questions/${questionId}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        return json({ fieldErrors }, { status: 400 });
      }
      return json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function QuestionDetail() {
  const { question, answers, questionAuthor, answerAuthors, currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Question header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
            <span>
              Asked {formatDistanceToNow(new Date(question.createdAt))} ago
            </span>
            <span>
              Viewed {question.viewCount} times
            </span>
          </div>
        </div>

        {/* Question and answers */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          {/* Question */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex">
              {/* Voting */}
              <div className="flex-shrink-0 flex flex-col items-center mr-6">
                {currentUser && currentUser.id !== question.userId ? (
                  <Form method="post" className="flex flex-col items-center">
                    <input type="hidden" name="intent" value="vote" />
                    <input type="hidden" name="value" value="1" />
                    <button
                      type="submit"
                      className="text-gray-400 hover:text-gray-700"
                      aria-label="Upvote"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </Form>
                ) : (
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                )}
                
                <div className="my-2 text-xl font-bold text-gray-700">{question.votes}</div>
                
                {currentUser && currentUser.id !== question.userId ? (
                  <Form method="post" className="flex flex-col items-center">
                    <input type="hidden" name="intent" value="vote" />
                    <input type="hidden" name="value" value="-1" />
                    <button
                      type="submit"
                      className="text-gray-400 hover:text-gray-700"
                      aria-label="Downvote"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </Form>
                ) : (
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Question content */}
              <div className="flex-1">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.bodyHtml }} />
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tags/${tag}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <div className="flex items-center bg-blue-50 p-3 rounded-md">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                        {questionAuthor?.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        <Link to={`/users/${questionAuthor?.id}`} className="hover:underline">
                          {questionAuthor?.username}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500">
                        {questionAuthor?.reputation} reputation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Answers */}
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
              </h2>
            </div>
            
            {answers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {answers.map((answer) => (
                  <div key={answer.id} className="px-6">
                    <AnswerCard
                      answer={answer}
                      user={answerAuthors[answer.userId]}
                      currentUserId={currentUser?.id}
                      questionUserId={question.userId}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No answers yet. Be the first to answer!
              </div>
            )}
          </div>
        </div>
        
        {/* Add answer form */}
        {currentUser ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Answer</h2>
            </div>
            
            {actionData?.error && (
              <div className="px-6 pt-4">
                <ErrorMessage>{actionData.error}</ErrorMessage>
              </div>
            )}
            
            <Form method="post" className="p-6">
              <input type="hidden" name="intent" value="answer" />
              <MarkdownEditor
                name="body"
                placeholder="Write your answer here..."
                required
                error={actionData?.fieldErrors?.body?.[0]}
              />
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Post Your Answer
                </button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 text-center">
              <p className="text-gray-700 mb-4">
                You need to be logged in to answer this question.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to={`/login?redirectTo=/questions/${question.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Log in
                </Link>
                <Link
                  to={`/register?redirectTo=/questions/${question.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
