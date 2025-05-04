import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllTags } from "~/models/tag.server";
import TagBadge from "~/components/TagBadge";

export const meta: MetaFunction = () => {
  return [
    { title: "Tags | Prompt Overflow" },
    { name: "description", content: "Browse all tags on Prompt Overflow" },
  ];
};

export async function loader() {
  const tags = await getAllTags();
  return json({ tags });
}

export default function Tags() {
  const { tags } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by tag name"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            A tag is a keyword or label that categorizes your question with other, similar questions.
            Using the right tags makes it easier for others to find and answer your question.
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tags.map((tag) => (
              <div key={tag.id} className="border border-gray-200 rounded-md p-4">
                <div className="mb-2">
                  <TagBadge tag={tag} />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {tag.description || `Questions related to ${tag.name}`}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {tag.count} {tag.count === 1 ? "question" : "questions"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No tags found.
          </div>
        )}
      </div>
    </div>
  );
}
