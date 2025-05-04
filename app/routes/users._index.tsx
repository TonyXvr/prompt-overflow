import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { User } from "~/models/user.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Users | Prompt Overflow" },
    { name: "description", content: "Browse all users on Prompt Overflow" },
  ];
};

// Mock function to get all users (replace with actual implementation)
async function getAllUsers(): Promise<User[]> {
  // This would be replaced with a real database query
  return [
    {
      id: "1",
      email: "alice@example.com",
      username: "alice",
      passwordHash: "",
      reputation: 120,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: "2",
      email: "bob@example.com",
      username: "bob",
      passwordHash: "",
      reputation: 85,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: "3",
      email: "charlie@example.com",
      username: "charlie",
      passwordHash: "",
      reputation: 230,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];
}

export async function loader() {
  const users = await getAllUsers();
  return json({ users });
}

export default function Users() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by username"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            Browse the Prompt Overflow community by user reputation and activity.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className="border border-gray-200 rounded-md p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.reputation} reputation
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
