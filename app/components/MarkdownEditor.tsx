import { useRef, useState } from "react";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function MarkdownEditor({
  name,
  defaultValue = "",
  error,
  label,
  placeholder = "Write your content here...",
  required = false,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertMarkdown = (markdownType: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let replacement = "";

    switch (markdownType) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        break;
      case "code":
        replacement = selectedText.includes("\n")
          ? `\`\`\`\n${selectedText || "code"}\n\`\`\``
          : `\`${selectedText || "code"}\``;
        break;
      case "link":
        replacement = `[${selectedText || "link text"}](url)`;
        break;
      case "list":
        replacement = `\n- ${selectedText || "list item"}\n- another item\n`;
        break;
      case "quote":
        replacement = `\n> ${selectedText || "quoted text"}\n`;
        break;
      default:
        return;
    }

    const newValue =
      value.substring(0, start) + replacement + value.substring(end);
    setValue(newValue);

    // Set focus back to textarea and update cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleInsertMarkdown("bold")}
            className="p-1 rounded hover:bg-gray-200"
            title="Bold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown("italic")}
            className="p-1 rounded hover:bg-gray-200"
            title="Italic"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="4" x2="10" y2="4"></line>
              <line x1="14" y1="20" x2="5" y2="20"></line>
              <line x1="15" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown("code")}
            className="p-1 rounded hover:bg-gray-200"
            title="Code"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown("link")}
            className="p-1 rounded hover:bg-gray-200"
            title="Link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown("list")}
            className="p-1 rounded hover:bg-gray-200"
            title="List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown("quote")}
            className="p-1 rounded hover:bg-gray-200"
            title="Quote"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={10}
          className="block w-full p-3 border-0 focus:ring-0 resize-y"
          placeholder={placeholder}
          required={required}
        ></textarea>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">
        Supports Markdown. You can use **bold**, *italic*, `code`, [links](url), and more.
      </p>
    </div>
  );
}
