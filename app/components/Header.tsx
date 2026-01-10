import Link from "next/link";
import { Sprout } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Agrideck</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-primary-600 transition">
              Features
            </Link>
            <Link href="/#download" className="text-gray-600 hover:text-primary-600 transition">
              Download
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-primary-600 transition">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-primary-600 transition">
              Terms
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="#download"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
