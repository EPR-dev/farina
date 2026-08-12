import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farina — The City That Never Was",
  description:
    "An interactive historical map exploring Farina, South Australia: what was planned, what happened, and a clearly labelled counterfactual — what if Farina had succeeded?",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
