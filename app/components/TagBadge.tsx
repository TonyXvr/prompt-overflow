import { Link } from "@remix-run/react";
import { Tag } from "~/models/tag.server";

interface TagBadgeProps {
  tag: Tag;
  showCount?: boolean;
}

export default function TagBadge({ tag, showCount = true }: TagBadgeProps) {
  return (
    <Link
      to={`/tags/${tag.name}`}
      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
    >
      {tag.name}
      {showCount && <span className="ml-1 text-xs text-blue-600">×{tag.count}</span>}
    </Link>
  );
}
