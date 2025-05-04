import { Link, Form } from "@remix-run/react";
import { Answer } from "~/models/answer.server";
import { User } from "~/models/user.server";
import { formatDistanceToNow } from "date-fns";

interface AnswerCardProps {
  answer: Answer;
  user?: User;
  currentUserId?: string;
  questionUserId?: string;
  isAccepted?: boolean;
}

export default function AnswerCard({
  answer,
  user,
  currentUserId,
  questionUserId,
  isAccepted = false,
}: AnswerCardProps) {
  const canAccept = currentUserId === questionUserId;
  
  return (
    <div className={`border-b border-gray-200 py-6 ${answer.isAccepted ? 'bg-green-50' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 flex flex-col items-center mr-4 text-center">
          {currentUserId ? (
            <Form method="post" action={`/answers/${answer.id}/vote`} className="flex flex-col items-center">
              <input type="hidden" name="value" value="1" />
              <button
                type="submit"
                className="text-gray-400 hover:text-gray-700"
                aria-label="Upvote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </Form>
          ) : (
            <div className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          )}
          
          <div className="my-1 text-gray-700 font-medium">{answer.votes}</div>
          
          {currentUserId ? (
            <Form method="post" action={`/answers/${answer.id}/vote`} className="flex flex-col items-center">
              <input type="hidden" name="value" value="-1" />
              <button
                type="submit"
                className="text-gray-400 hover:text-gray-700"
                aria-label="Downvote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </Form>
          ) : (
            <div className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
          
          {answer.isAccepted && (
            <div className="mt-2 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: answer.body }} />
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Answered {formatDistanceToNow(new Date(answer.createdAt))} ago by{" "}
              <Link to={`/users/${answer.userId}`} className="text-blue-600 hover:text-blue-800">
                {user?.username || "User"}
              </Link>
            </div>
            
            {canAccept && !answer.isAccepted && (
              <Form method="post" action={`/answers/${answer.id}/accept`}>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Accept Answer
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
