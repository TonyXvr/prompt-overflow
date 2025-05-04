import { Link } from "@remix-run/react";
import { Question } from "~/models/question.server";
import { User } from "~/models/user.server";
import { formatDistanceToNow } from "date-fns";

interface QuestionCardProps {
  question: Question;
  user?: User;
}

export default function QuestionCard({ question, user }: QuestionCardProps) {
  return (
    <div className="border-b border-gray-200 py-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 flex flex-col items-center mr-4 text-center">
          <div className="text-gray-700 font-medium">
            {question.votes}
            <div className="text-xs text-gray-500">votes</div>
          </div>
          <div className="mt-2 text-gray-700 font-medium">
            {question.viewCount}
            <div className="text-xs text-gray-500">views</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
            <Link to={`/questions/${question.id}`}>{question.title}</Link>
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {question.body.length > 200
              ? question.body.substring(0, 200) + "..."
              : question.body}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
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
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>
              Asked {formatDistanceToNow(new Date(question.createdAt))} ago by{" "}
              <Link
                to={`/users/${question.userId}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {user?.username || "User"}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
