import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelp Your Neighbor",
  description: "Connecting communities through local support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
