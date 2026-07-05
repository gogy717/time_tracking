import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "专注追踪 · FOCUS TRACKER",
  description: "追踪你的专注时间，记录每个领域的成长",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
