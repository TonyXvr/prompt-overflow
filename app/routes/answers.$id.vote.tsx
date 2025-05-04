import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { getAnswerById, voteAnswer } from "~/models/answer.server";
import { requireUser } from "~/utils/auth.server";
import { updateUserReputation } from "~/models/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const answerId = params.id;
  if (!answerId) {
    throw new Response("Answer ID is required", { status: 400 });
  }

  const user = await requireUser(request);
  const formData = await request.formData();
  const value = Number(formData.get("value"));

  if (value !== 1 && value !== -1) {
    return json({ error: "Invalid vote value" }, { status: 400 });
  }

  const answer = await getAnswerById(answerId);
  if (!answer) {
    return json({ error: "Answer not found" }, { status: 404 });
  }

  // Don't allow voting on your own answer
  if (answer.userId === user.id) {
    return json({ error: "You cannot vote on your own answer" }, { status: 400 });
  }

  // Update the answer's vote count
  await voteAnswer(answerId, value as 1 | -1);

  // Update the author's reputation
  await updateUserReputation(answer.userId, value);

  // Redirect back to the question
  return redirect(`/questions/${answer.questionId}`);
}
