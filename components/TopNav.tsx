import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const LINKS = [
  { href: "/dashboard", label: "Revenue at risk" },
  { href: "/queue", label: "Recovery queue" },
  { href: "/upload", label: "Import quotes" },
];

export function TopNav() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/growmatic-logo-horizontal.png"
              alt="GrowMatic SA"
              width={140}
              height={93}
              className="h-8 w-auto"
              priority
            />
            <span className="text-sm font-medium text-foreground-dim border-l border-border pl-2.5">
              Recover
            </span>
          </Link>
          <nav className="flex gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground-dim hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
