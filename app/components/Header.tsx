import Link from "next/link";
import { Sprout } from "lucide-react";
import NavLink from "./NavLink";
import Button from "./Button";

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
            <NavLink href="/#features">
              Features
            </NavLink>
            <NavLink href="/#download">
              Download
            </NavLink>
            <NavLink href="/privacy">
              Privacy
            </NavLink>
            <NavLink href="/terms">
              Terms
            </NavLink>
          </div>

          <div className="flex items-center space-x-4">
            <Button href="#download">
              Get Started
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
