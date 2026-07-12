import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/jobs", label: "Jobs" },
  { href: "/invoices", label: "Invoices" },
];

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span className="font-semibold text-gray-900">Ocean Outdoor Services</span>
        <nav className="flex gap-4 text-sm font-medium text-gray-600">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-emerald-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
