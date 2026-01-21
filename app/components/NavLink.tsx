import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <Link href={href} className={`text-gray-600 hover:text-primary-600 transition ${className || ''}`}>
      {children}
    </Link>
  );
}
