// Admin section layout — strips public Navbar, Footer, and FloatingChat.
// Next.js uses this layout instead of the root layout's children wrapper
// because it is a nested segment. The <html>/<body> still come from
// the root layout, but we render ONLY {children} here — no shell components.

export const metadata = {
  title: "Admin Portal | Zylo CRM",
  description: "Zylo CRM Admin Portal — Secure Access",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
