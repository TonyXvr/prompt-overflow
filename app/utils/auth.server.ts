import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { getUserById, getUserByEmail, createUser } from "~/models/user.server";

// Session storage
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__prompt_overflow_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cr3t"], // In production, use environment variables
    secure: process.env.NODE_ENV === "production",
  },
});

// Get the user session
export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

// Get the logged in user
export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) return null;
  
  try {
    return await getUserById(userId);
  } catch {
    throw await logout(request);
  }
}

// Require user to be logged in
export async function requireUser(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const user = await getUser(request);
  if (!user) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}

// Login user
export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  
  return user;
}

// Register new user
export async function register(email: string, username: string, password: string) {
  const existingUserByEmail = await getUserByEmail(email);
  if (existingUserByEmail) return null;
  
  const passwordHash = await bcrypt.hash(password, 10);
  return createUser(email, username, passwordHash);
}

// Create user session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

// Logout user
export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
