import Link from "next/link";
import { Sprout, Mail, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">Agrideck</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connecting farmers and buyers for agricultural produce. A modern marketplace built to empower farmers and streamline agricultural trade.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/sarveshhh-m/agrideck-stable"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="mailto:support@agrideck.com"
                className="text-gray-400 hover:text-primary-500 transition"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="hover:text-primary-500 transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#download" className="hover:text-primary-500 transition">
                  Download
                </Link>
              </li>
              <li>
                <a href="https://github.com/sarveshhh-m/agrideck-stable" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-primary-500 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-500 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Agrideck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
