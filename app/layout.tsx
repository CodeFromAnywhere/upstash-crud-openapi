export const metadata = {
  title: "OpenAPI Combination Proxy",
  description: "Combine mutliple (subsets of) OpenAPIs into one.",
};
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
