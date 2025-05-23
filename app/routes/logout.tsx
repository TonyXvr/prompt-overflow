import { ActionFunctionArgs } from "@remix-run/node";
import { logout } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export function loader() {
  return redirect("/login");
}
