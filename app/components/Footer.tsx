import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center gap-8">
          <Link href="/privacy" className="hover:text-primary-500 transition">
            Privacy Policy
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/terms" className="hover:text-primary-500 transition">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
