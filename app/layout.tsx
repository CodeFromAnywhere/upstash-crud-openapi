export const metadata = {
  title: "OpenAPI CRUD",
  description: "Create a simple CRUD OpenAPI for any schema with ease...",
};
import "./globals.css";
import "openapi-for-humans-react/css.css";
import "react-openapi-form/css.css";

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
