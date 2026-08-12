import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farina — Being Made Again",
  description:
    "An interactive historical map of Farina, South Australia: what was planned, what faded, what volunteers are restoring today, and a fun story of what could have been if Farina had thrived.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
