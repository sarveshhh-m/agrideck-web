import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  asChild?: boolean;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  href: string;
  asChild?: boolean;
};

type CombinedButtonProps = ButtonProps | LinkButtonProps;

export default function Button(props: CombinedButtonProps) {
  const baseClasses = "inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

  if ("href" in props && props.href) {
    const { href, children, className, ...linkRest } = props as LinkButtonProps;
    return (
      <Link href={href} className={`${baseClasses} ${className || ""}`} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { children, className, type, ...buttonRest } = props as ButtonProps;
  return (
    <button type={(type as "button" | "submit" | "reset") || "button"} className={`${baseClasses} ${className || ""}`} {...buttonRest}>
      {children}
    </button>
  );
}
