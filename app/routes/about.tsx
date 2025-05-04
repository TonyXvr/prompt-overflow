import { type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "About | Prompt Overflow" },
    { name: "description", content: "Learn about Prompt Overflow, a community for AI prompt engineers" },
  ];
};

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Prompt Overflow</h1>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="p-6 prose max-w-none">
            <h2>Our Mission</h2>
            <p>
              Prompt Overflow is a community-driven platform where AI prompt engineers can learn, share knowledge, and build their careers.
              We're dedicated to helping people write better prompts for AI systems like ChatGPT, Midjourney, DALL-E, and more.
            </p>
            
            <h2>How It Works</h2>
            <p>
              Prompt Overflow is modeled after Stack Overflow, but specifically focused on AI prompt engineering:
            </p>
            <ul>
              <li>
                <strong>Ask questions</strong> about prompt engineering techniques, specific AI models, or how to achieve certain outputs
              </li>
              <li>
                <strong>Answer questions</strong> to share your knowledge and help others
              </li>
              <li>
                <strong>Vote on content</strong> to help the best information rise to the top
              </li>
              <li>
                <strong>Build reputation</strong> by contributing valuable content to the community
              </li>
            </ul>
            
            <h2>Our Community</h2>
            <p>
              Prompt Overflow is for anyone interested in AI prompt engineering, including:
            </p>
            <ul>
              <li>AI enthusiasts and hobbyists</li>
              <li>Professional prompt engineers</li>
              <li>Developers integrating AI into their applications</li>
              <li>Content creators using AI tools</li>
              <li>Researchers exploring AI capabilities</li>
            </ul>
            
            <h2>Join Us</h2>
            <p>
              Ready to be part of our community? <Link to="/register" className="text-blue-600 hover:text-blue-800">Sign up</Link> for a free account to start asking and answering questions.
              Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800">Log in</Link> to continue your journey.
            </p>
            
            <h2>Contact</h2>
            <p>
              Have questions or feedback? Contact us at <a href="mailto:support@promptoverflow.com" className="text-blue-600 hover:text-blue-800">support@promptoverflow.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
