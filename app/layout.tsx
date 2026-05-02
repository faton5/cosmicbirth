import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CosmicBirth",
  description: "Discover the NASA image from the day you were born",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
