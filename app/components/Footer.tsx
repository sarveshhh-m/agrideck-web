import Link from "next/link";
import NavLink from "./NavLink";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center gap-8">
          <NavLink href="/privacy">
            Privacy Policy
          </NavLink>
          <span className="text-gray-600">•</span>
          <NavLink href="/terms">
            Terms & Conditions
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
