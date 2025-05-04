import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link to="/" className="text-base text-gray-500 hover:text-gray-900">
              Home
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/questions" className="text-base text-gray-500 hover:text-gray-900">
              Questions
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/tags" className="text-base text-gray-500 hover:text-gray-900">
              Tags
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/users" className="text-base text-gray-500 hover:text-gray-900">
              Users
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
              About
            </Link>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} Prompt Overflow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
