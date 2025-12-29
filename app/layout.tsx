import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram DM Automation",
  description: "Automate personalised Instagram direct messages with scheduling and template management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
