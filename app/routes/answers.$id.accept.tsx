import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { getAnswerById, acceptAnswer } from "~/models/answer.server";
import { getQuestionById } from "~/models/question.server";
import { requireUser } from "~/utils/auth.server";
import { updateUserReputation } from "~/models/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const answerId = params.id;
  if (!answerId) {
    throw new Response("Answer ID is required", { status: 400 });
  }

  const user = await requireUser(request);
  
  const answer = await getAnswerById(answerId);
  if (!answer) {
    return json({ error: "Answer not found" }, { status: 404 });
  }

  // Get the question to check if the current user is the author
  const question = await getQuestionById(answer.questionId);
  if (!question) {
    return json({ error: "Question not found" }, { status: 404 });
  }

  // Only the question author can accept an answer
  if (question.userId !== user.id) {
    return json({ error: "Only the question author can accept an answer" }, { status: 403 });
  }

  // Accept the answer
  await acceptAnswer(answerId);

  // Give reputation bonus to the answer author
  await updateUserReputation(answer.userId, 15);

  // Redirect back to the question
  return redirect(`/questions/${answer.questionId}`);
}
